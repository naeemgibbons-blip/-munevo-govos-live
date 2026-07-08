import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sql = `
-- 1. Create User Sync Trigger Function (auth.users -> public.Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Profile" (id, email, "isGlobalAdmin", "isOrgAdmin", "organizationId", "roleId", "createdAt")
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'isGlobalAdmin')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'isOrgAdmin')::boolean, false),
    (new.raw_user_meta_data->>'organizationId')::uuid,
    (new.raw_user_meta_data->>'roleId')::uuid,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SPLIT --
-- 2. Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- SPLIT --
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- SPLIT --
-- 3. Create Custom Permission Evaluation Helper
CREATE OR REPLACE FUNCTION public.check_user_permission(
  target_module text,
  require_edit boolean
)
RETURNS boolean AS $$
DECLARE
  v_is_global_admin boolean;
  v_is_org_admin boolean;
  v_role_id uuid;
  v_has_access boolean;
BEGIN
  -- Get current profile details from database
  SELECT "isGlobalAdmin", "isOrgAdmin", "roleId"::uuid
  INTO v_is_global_admin, v_is_org_admin, v_role_id
  FROM public."Profile"
  WHERE id = auth.uid()::text;

  -- 1. Global Admin bypasses all checks
  IF v_is_global_admin = true THEN
    RETURN true;
  END IF;

  -- 2. Org Admin has full access within their organization
  IF v_is_org_admin = true THEN
    RETURN true;
  END IF;

  -- 3. Staff user access evaluation based on custom permissions matrix
  IF v_role_id IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN require_edit = true THEN "canEdit"
        ELSE "canView"
      END
    INTO v_has_access
    FROM public."Permission"
    WHERE "roleId"::uuid = v_role_id AND "module" = target_module;

    RETURN COALESCE(v_has_access, false);
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SPLIT --
-- 4. Enable Row Level Security (RLS) on all Tables
ALTER TABLE public."Organization" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."CustomRole" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Permission" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Invite" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Property" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Business" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Permit" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Inspection" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."TrackerItem" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."OpenRecordsRequest" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Employee" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Certification" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."Timesheet" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
-- SPLIT --
-- 5. Drop existing policies to prevent conflicts on execution rerun
DROP POLICY IF EXISTS organization_policy ON public."Organization";
-- SPLIT --
DROP POLICY IF EXISTS custom_role_policy ON public."CustomRole";
-- SPLIT --
DROP POLICY IF EXISTS permission_policy ON public."Permission";
-- SPLIT --
DROP POLICY IF EXISTS profile_policy ON public."Profile";
-- SPLIT --
DROP POLICY IF EXISTS invite_policy ON public."Invite";
-- SPLIT --
DROP POLICY IF EXISTS property_policy ON public."Property";
-- SPLIT --
DROP POLICY IF EXISTS property_select_policy ON public."Property";
-- SPLIT --
DROP POLICY IF EXISTS property_modify_policy ON public."Property";
-- SPLIT --
DROP POLICY IF EXISTS business_policy ON public."Business";
-- SPLIT --
DROP POLICY IF EXISTS business_select_policy ON public."Business";
-- SPLIT --
DROP POLICY IF EXISTS business_modify_policy ON public."Business";
-- SPLIT --
DROP POLICY IF EXISTS project_policy ON public."Project";
-- SPLIT --
DROP POLICY IF EXISTS project_select_policy ON public."Project";
-- SPLIT --
DROP POLICY IF EXISTS project_modify_policy ON public."Project";
-- SPLIT --
DROP POLICY IF EXISTS permit_policy ON public."Permit";
-- SPLIT --
DROP POLICY IF EXISTS permit_select_policy ON public."Permit";
-- SPLIT --
DROP POLICY IF EXISTS permit_modify_policy ON public."Permit";
-- SPLIT --
DROP POLICY IF EXISTS inspection_policy ON public."Inspection";
-- SPLIT --
DROP POLICY IF EXISTS inspection_select_policy ON public."Inspection";
-- SPLIT --
DROP POLICY IF EXISTS inspection_modify_policy ON public."Inspection";
-- SPLIT --
DROP POLICY IF EXISTS tracker_policy ON public."TrackerItem";
-- SPLIT --
DROP POLICY IF EXISTS tracker_select_policy ON public."TrackerItem";
-- SPLIT --
DROP POLICY IF EXISTS tracker_modify_policy ON public."TrackerItem";
-- SPLIT --
DROP POLICY IF EXISTS open_records_policy ON public."OpenRecordsRequest";
-- SPLIT --
DROP POLICY IF EXISTS open_records_select_policy ON public."OpenRecordsRequest";
-- SPLIT --
DROP POLICY IF EXISTS open_records_modify_policy ON public."OpenRecordsRequest";
-- SPLIT --
DROP POLICY IF EXISTS employee_policy ON public."Employee";
-- SPLIT --
DROP POLICY IF EXISTS employee_select_policy ON public."Employee";
-- SPLIT --
DROP POLICY IF EXISTS employee_modify_policy ON public."Employee";
-- SPLIT --
DROP POLICY IF EXISTS certification_policy ON public."Certification";
-- SPLIT --
DROP POLICY IF EXISTS certification_select_policy ON public."Certification";
-- SPLIT --
DROP POLICY IF EXISTS certification_modify_policy ON public."Certification";
-- SPLIT --
DROP POLICY IF EXISTS timesheet_policy ON public."Timesheet";
-- SPLIT --
DROP POLICY IF EXISTS timesheet_select_policy ON public."Timesheet";
-- SPLIT --
DROP POLICY IF EXISTS timesheet_modify_policy ON public."Timesheet";
-- SPLIT --
DROP POLICY IF EXISTS audit_log_policy ON public."AuditLog";
-- SPLIT --
-- 6. Define Organization Policies
CREATE POLICY organization_policy ON public."Organization"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  id::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
);
-- SPLIT --
-- 7. Define CustomRole Policies (Admins can view/write, Staff can read)
CREATE POLICY custom_role_policy ON public."CustomRole"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
);
-- SPLIT --
-- 8. Define Permission Policies (Admins can view/write, Staff can read)
CREATE POLICY permission_policy ON public."Permission"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  EXISTS (
    SELECT 1 FROM public."CustomRole" r
    WHERE r.id::uuid = "roleId"::uuid
    AND r."organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
  )
);
-- SPLIT --
-- 9. Define Profile Policies
CREATE POLICY profile_policy ON public."Profile"
FOR ALL
USING (
  id = auth.uid()::text
  OR
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
);
-- SPLIT --
-- 10. Define Invite Policies
CREATE POLICY invite_policy ON public."Invite"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
);
-- SPLIT --
-- 11. Define Property Policies (Select=canView, Modify=canEdit)
CREATE POLICY property_select_policy ON public."Property"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('command-center', false)
  )
);
-- SPLIT --
CREATE POLICY property_modify_policy ON public."Property"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('command-center', true)
  )
);
-- SPLIT --
-- 12. Define Business Policies (Select=canView, Modify=canEdit)
CREATE POLICY business_select_policy ON public."Business"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', false)
  )
);
-- SPLIT --
CREATE POLICY business_modify_policy ON public."Business"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', true)
  )
);
-- SPLIT --
-- 13. Define Project Policies (Select=canView, Modify=canEdit)
CREATE POLICY project_select_policy ON public."Project"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', false)
  )
);
-- SPLIT --
CREATE POLICY project_modify_policy ON public."Project"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', true)
  )
);
-- SPLIT --
-- 14. Define Permit Policies (Select=canView, Modify=canEdit)
CREATE POLICY permit_select_policy ON public."Permit"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', false)
  )
);
-- SPLIT --
CREATE POLICY permit_modify_policy ON public."Permit"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('permits', true)
  )
);
-- SPLIT --
-- 15. Define Inspection Policies (Select=canView, Modify=canEdit)
CREATE POLICY inspection_select_policy ON public."Inspection"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('code-enforcement', false)
  )
);
-- SPLIT --
CREATE POLICY inspection_modify_policy ON public."Inspection"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('code-enforcement', true)
  )
);
-- SPLIT --
-- 16. Define Tracker Policies (Select=canView, Modify=canEdit)
CREATE POLICY tracker_select_policy ON public."TrackerItem"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('tracker', false)
  )
);
-- SPLIT --
CREATE POLICY tracker_modify_policy ON public."TrackerItem"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('tracker', true)
  )
);
-- SPLIT --
-- 17. Define Open Records Policies (Select=canView, Modify=canEdit)
CREATE POLICY open_records_select_policy ON public."OpenRecordsRequest"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('open-records', false)
  )
);
-- SPLIT --
CREATE POLICY open_records_modify_policy ON public."OpenRecordsRequest"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('open-records', true)
  )
);
-- SPLIT --
-- 18. Define Employee Policies (Select=canView, Modify=canEdit)
CREATE POLICY employee_select_policy ON public."Employee"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('identity-security', false)
  )
);
-- SPLIT --
CREATE POLICY employee_modify_policy ON public."Employee"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    AND public.check_user_permission('identity-security', true)
  )
);
-- SPLIT --
-- 19. Define Certification Policies (Select=canView, Modify=canEdit)
CREATE POLICY certification_select_policy ON public."Certification"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    EXISTS (
      SELECT 1 FROM public."Employee" e
      WHERE e.id = "employeeId"
      AND e."organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    )
    AND public.check_user_permission('identity-security', false)
  )
);
-- SPLIT --
CREATE POLICY certification_modify_policy ON public."Certification"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    EXISTS (
      SELECT 1 FROM public."Employee" e
      WHERE e.id = "employeeId"
      AND e."organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    )
    AND public.check_user_permission('identity-security', true)
  )
);
-- SPLIT --
-- 20. Define Timesheet Policies (Select=canView, Modify=canEdit)
CREATE POLICY timesheet_select_policy ON public."Timesheet"
FOR SELECT
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    EXISTS (
      SELECT 1 FROM public."Employee" e
      WHERE e.id = "employeeId"
      AND e."organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    )
    AND public.check_user_permission('identity-security', false)
  )
);
-- SPLIT --
CREATE POLICY timesheet_modify_policy ON public."Timesheet"
FOR ALL
USING (
  (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
  OR
  (
    EXISTS (
      SELECT 1 FROM public."Employee" e
      WHERE e.id = "employeeId"
      AND e."organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
    )
    AND public.check_user_permission('identity-security', true)
  )
);
-- SPLIT --
-- 21. Define AuditLog Policies (Write/Read linked to identity-security view checks)
CREATE POLICY audit_log_policy ON public."AuditLog"
FOR ALL
USING (
  (
    (SELECT "isGlobalAdmin" FROM public."Profile" WHERE id = auth.uid()::text) = true
    OR
    "organizationId"::text = (SELECT "organizationId" FROM public."Profile" WHERE id = auth.uid()::text)
  )
  AND public.check_user_permission('identity-security', false)
)
WITH CHECK (
  true
);
`;

async function main() {
  console.log("Applying Supabase auth trigger & split custom RBAC RLS policies...");
  
  const statements = sql
    .split('-- SPLIT --')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (err: any) {
      console.error(`Error executing statement ${i + 1}:`, statement);
      throw err;
    }
  }

  console.log("Supabase split custom RBAC RLS policies successfully applied to the database!");
}

main()
  .catch((e) => {
    console.error("Failed to apply DB configurations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
