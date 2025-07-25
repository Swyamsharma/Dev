import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin, reset } from '../../features/user/userSlice';
import Loader from '../../components/Loader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useDebounce } from '../../hooks/useDebounce';
import { VscSearch, VscCheck } from 'react-icons/vsc';
import FilterPopover from '../../components/FilterPopover';

const USERS_PER_PAGE = 15;

function AdminUsersPage() {
    const dispatch = useDispatch();
    const { user: loggedInAdmin } = useSelector((state) => state.auth);
    const { adminUsers, isLoading, isUpdating } = useSelector((state) => state.user);

    const [modalState, setModalState] = useState({ isOpen: false, userId: null });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        const filters = {
            search: debouncedSearchQuery,
            role: roleFilter,
        };
        if (!filters.search) delete filters.search;
        if (!filters.role) delete filters.role;
        
        dispatch(getAllUsers(filters));
    }, [debouncedSearchQuery, roleFilter, dispatch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, roleFilter]);

    useEffect(() => {
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUserByAdmin({ userId, userData: { role: newRole } })).then((action) => {
            if (updateUserByAdmin.fulfilled.match(action)) {
                toast.success("User role updated successfully!");
            } else {
                toast.error(action.payload || "Failed to update role.");
            }
        });
    };

    const handleDeleteClick = (userId) => {
        setModalState({ isOpen: true, userId });
    };

    const handleConfirmDelete = () => {
        if (modalState.userId) {
            dispatch(deleteUserByAdmin(modalState.userId)).then((action) => {
                if (deleteUserByAdmin.fulfilled.match(action)) {
                    toast.success("User deleted successfully!");
                } else {
                    toast.error(action.payload || "Failed to delete user.");
                }
            });
        }
        setModalState({ isOpen: false, userId: null });
    };
    
    const closeModal = () => {
        setModalState({ isOpen: false, userId: null });
    };

    if (isLoading && !adminUsers.length) {
        return <Loader />;
    }

    const totalPages = Math.ceil(adminUsers.length / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const currentUsers = adminUsers.slice(startIndex, endIndex);
    
    const roleOptions = ["All Roles", "user", "admin"];

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Manage Users</h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-accent hover:text-accent-hover">
                        ← Back to Dashboard
                    </Link>
                </div>
                
                {/* Filter Bar for Admin Users */}
                 <div className="bg-primary border border-border-color rounded-lg p-4 mb-6 flex items-end gap-4">
                    <div className="relative flex-grow">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
                        <VscSearch className="absolute left-3 bottom-2.5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm"
                        />
                    </div>
                    <div className="w-48">
                        <FilterPopover label="Role" selectedCount={roleFilter ? 1 : 0} widthClass="w-48">
                            <ul className="space-y-1">
                                {roleOptions.map(r => (
                                    <li key={r} onClick={() => setRoleFilter(r === 'All Roles' ? '' : r)} className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 cursor-pointer ${roleFilter === r || (roleFilter === '' && r === 'All Roles') ? 'bg-slate-700/50' : ''}`}>
                                        <span className="text-text-primary capitalize">{r}</span>
                                        {(roleFilter === r || (roleFilter === '' && r === 'All Roles')) && <VscCheck className="text-accent"/>}
                                    </li>
                                ))}
                            </ul>
                        </FilterPopover>
                    </div>
                </div>

                <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {currentUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user._id === loggedInAdmin._id ? (
                                            <span className="font-semibold text-accent">{user.role}</span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={isUpdating}
                                                className="p-1 border rounded text-sm bg-secondary text-text-primary border-border-color focus:ring-accent focus:border-accent disabled:opacity-50"
                                            >
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user._id !== loggedInAdmin._id ? (
                                            <button 
                                                onClick={() => handleDeleteClick(user._id)} 
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <span className="text-slate-500 text-xs">Cannot Delete Self</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {adminUsers.length === 0 && (
                        <div className="text-center py-10 text-text-secondary">No users found matching your filters.</div>
                    )}
                </div>
                
                {totalPages > 1 && (
                     <div className="mt-6 flex justify-between items-center text-sm">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-md bg-secondary hover:bg-slate-700/50 text-text-primary border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-text-secondary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-md bg-secondary hover:bg-slate-700/50 text-text-primary border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirm User Deletion"
                message="Are you sure you want to delete this user? All associated data will be orphaned. This action is permanent."
                confirmText="Delete User"
            />
        </>
    );
}

export default AdminUsersPage;