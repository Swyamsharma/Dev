import axios from '../../api/axios';
const API_URL = '/api/submissions';

const getTokenConfig = (thunkAPI) => ({
    headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` }
});

const createSubmission = async (submissionData, thunkAPI) => {
    const response = await axios.post(API_URL, submissionData, getTokenConfig(thunkAPI));
    return response.data;
};

const getSubmissions = async (problemId, thunkAPI) => {
    const response = await axios.get(`${API_URL}?problemId=${problemId}`, getTokenConfig(thunkAPI));
    return response.data;
}

const getSubmissionDetail = async(submissionId, thunkAPI) => {
    const response = await axios.get(`${API_URL}/${submissionId}`, getTokenConfig(thunkAPI));
    return response.data;
}

const getMySubmissions = async (thunkAPI) => {
    const response = await axios.get(`${API_URL}/me`, getTokenConfig(thunkAPI));
    return response.data;
};

const getAllSubmissions = async (filters, thunkAPI) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/all?${params}`, getTokenConfig(thunkAPI));
    return response.data;
};

const deleteSubmission = async (submissionId, thunkAPI) => {
    const response = await axios.delete(`${API_URL}/${submissionId}`, getTokenConfig(thunkAPI));
    return response.data;
};

const submissionService = { createSubmission, getSubmissions, getSubmissionDetail, getMySubmissions, getAllSubmissions, deleteSubmission };
export default submissionService;