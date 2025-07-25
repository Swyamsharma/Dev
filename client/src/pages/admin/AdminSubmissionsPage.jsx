import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllSubmissions, deleteSubmission, reset, getSubmissionDetail, resetSelected } from '../../features/submissions/submissionSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useDebounce } from '../../hooks/useDebounce';
import { VscSearch, VscCheck } from 'react-icons/vsc';
import FilterPopover from '../../components/FilterPopover';
import AdminSubmissionViewModal from '../../components/AdminSubmissionViewModal';

const SUBMISSIONS_PER_PAGE = 15;

function AdminSubmissionsPage() {
    const dispatch = useDispatch();
    const { allSubmissions, isFetchingAll, isDeleting, selectedSubmission, isFetchingDetail } = useSelector((state) => state.submission);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [verdictFilter, setVerdictFilter] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        const filters = {
            search: debouncedSearchQuery,
            verdict: verdictFilter,
        };
        if (!filters.search) delete filters.search;
        if (!filters.verdict) delete filters.verdict;

        dispatch(getAllSubmissions(filters));
    }, [debouncedSearchQuery, verdictFilter, dispatch]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, verdictFilter]);

    useEffect(() => {
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const handleViewClick = (submissionId) => {
        dispatch(getSubmissionDetail(submissionId));
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        dispatch(resetSelected());
    };

    const handleDeleteClick = (id) => {
        setSubmissionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (submissionToDelete) {
            dispatch(deleteSubmission(submissionToDelete)).then((result) => {
                if (deleteSubmission.fulfilled.match(result)) {
                    toast.success('Submission deleted successfully!');
                } else {
                    toast.error(result.payload || 'Failed to delete submission.');
                }
            });
        }
        closeDeleteModal();
    };
    
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSubmissionToDelete(null);
    };

    if (isFetchingAll && !allSubmissions.length) {
        return <Loader />;
    }

    const totalPages = Math.ceil(allSubmissions.length / SUBMISSIONS_PER_PAGE);
    const startIndex = (currentPage - 1) * SUBMISSIONS_PER_PAGE;
    const endIndex = startIndex + SUBMISSIONS_PER_PAGE;
    const currentSubmissions = allSubmissions.slice(startIndex, endIndex);

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-400';
            case 'Wrong Answer': return 'text-red-400';
            case 'Time Limit Exceeded': case 'Memory Limit Exceeded': return 'text-orange-400';
            case 'Compilation Error': return 'text-yellow-400';
            default: return 'text-text-secondary';
        }
    };
    
    const verdictOptions = ["All Verdicts", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Compilation Error", "Runtime Error", "System Error", "Pending"];

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">All Submissions</h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-accent hover:text-accent-hover">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="bg-primary border border-border-color rounded-lg p-4 mb-6 flex items-end gap-4">
                    <div className="relative flex-grow">
                         <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
                        <VscSearch className="absolute left-3 bottom-2.5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by User or Problem..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm"
                        />
                    </div>
                    <div className="w-56">
                        <FilterPopover label="Verdict" selectedCount={verdictFilter ? 1 : 0} widthClass="w-56">
                            <ul className="space-y-1">
                                {verdictOptions.map(v => (
                                    <li key={v} onClick={() => setVerdictFilter(v === 'All Verdicts' ? '' : v)} className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 cursor-pointer ${verdictFilter === v || (verdictFilter === '' && v === 'All Verdicts') ? 'bg-slate-700/50' : ''}`}>
                                        <span className={getVerdictColor(v)}>{v}</span>
                                        {(verdictFilter === v || (verdictFilter === '' && v === 'All Verdicts')) && <VscCheck className="text-accent"/>}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Problem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Verdict</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {currentSubmissions.map(sub => (
                                <tr key={sub._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{sub.userId?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                        <Link to={`/problems/${sub.problemId?._id}`} className="hover:text-accent">
                                            {sub.problemId?.title || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getVerdictColor(sub.verdict)}`}>{sub.verdict}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewClick(sub._id)} className="text-accent hover:text-accent-hover">View</button>
                                        <button onClick={() => handleDeleteClick(sub._id)} className="text-red-500 hover:text-red-400" disabled={isDeleting}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {allSubmissions.length === 0 && !isFetchingAll && (
                    <div className="text-center py-10 text-text-secondary">
                        No submissions found matching your filters.
                    </div>
                )}
                
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
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this submission? This will also remove the source code from storage. This action is permanent and cannot be undone."
                confirmText="Delete"
            />
            <AdminSubmissionViewModal
                isOpen={isViewModalOpen}
                onClose={closeViewModal}
                submission={selectedSubmission}
                isFetchingDetail={isFetchingDetail}
            />
        </>
    );
}

export default AdminSubmissionsPage;