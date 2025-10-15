export {
    createAdmin,
    assignAdminToBranch,
    revokeAdminFromBranch,
    updateAdminStatus,
    createAdministratorComplete,
    updateAdministratorComplete,
    deleteAdministratorComplete
} from "./mutations";
export { getAdmin, listAdminsUnassigned, getAdminByUser, getMyBranch, getAllWithDetails, getById } from "./queries";
