import { createContext, useContext, useMemo } from 'react';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import axios from 'axios';

const AdminContext = createContext();

export const useAdminContext = () => {
    return useContext(AdminContext);
};

const useFetchData = (url) => {
    return useQuery(url, async () => {
        const response = await axios.get(url);
        if (!response.data) throw new Error(`Failed to fetch data from ${url}`);
        return response.data;
    });
};

const AdminProvider = ({ children, selectedBranchTag }) => {
    const value = useFetchValue(selectedBranchTag);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

const useFetchValue = (branch_tag) => {
    const fetchBranches = useFetchData('/api/branches');
    const fetchProfs = useFetchData(`/api/profs/${branch_tag}`);
    const fetchCourses = useFetchData(`/api/courses/${branch_tag}`);

    return useMemo(() => ({
        branches: fetchBranches.data,
        branchError: fetchBranches.error,
        profs: fetchProfs.data,
        profsError: fetchProfs.error,
        courses: fetchCourses.data,
        coursesError: fetchCourses.error,
    }), [fetchBranches.data, fetchBranches.error, fetchProfs.data, fetchProfs.error, fetchCourses.data, fetchCourses.error]);
};

//Separate API Context
const useDelBranchMutation = () => {
    const queryClient = useQueryClient();

    const delBranch = async (branch_tag) => {
        try {
            const response = await axios.delete(`/admin/delBranch/${branch_tag}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data.error || 'Failed to delete branch. Please try again later.');
        }
    };

    return useMutation(delBranch, {
        onSuccess: () => {
            queryClient.invalidateQueries('branches');
        },
    });
};

const useAddBranchMutation = () => {
    const queryClient = useQueryClient();

    const addBranch = async (branchData) => {
        try {
            const response = await axios.post('/admin/addBranch', branchData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data.error || 'Failed to add branch. Please try again later.');
        }
    };

    return useMutation(addBranch, {
        onSuccess: () => {
            queryClient.invalidateQueries('branches');
        },
    });
};

const useAddProfMutation = () => {
    const queryClient = useQueryClient();

    const addProf = async (formData) => {
        try {
            const response = await axios.post('/admin/addProf', formData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data.error || 'Unknown error');
        }
    };

    return useMutation(addProf, {
        onSuccess: () => {
            queryClient.invalidateQueries('addProf');
        },
    });
};

const useUpdateProfMutation = (onSuccessCallback, onErrorCallback) => {
    const queryClient = useQueryClient();

    const updateProf = async ({ id, name, email, role }) => {
        try {
            const response = await axios.put(`/admin/updateProf/${id}`, { name, email, role });
            return response.data;
        } catch (error) {
            return { error: error.response?.data.error || 'Unknown error' };
        }
    };

    return useMutation(updateProf, {
        onSuccess: (data) => {
            queryClient.invalidateQueries('updateProf');
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error) => {
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        },
    });
};

const useDeleteProfMutation = (onSuccessCallback, onErrorCallback) => {
    const queryClient = useQueryClient();

    const deleteProf = async (id) => {
        try {
            const response = await axios.delete(`/admin/deleteProf/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data.error || 'Unknown error');
        }
    };

    return useMutation(deleteProf, {
        onSuccess: (data) => {
            queryClient.invalidateQueries('delProf');
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error) => {
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        },
    });
};

const useImportCourseMutation = (onSuccessCallback, onErrorCallback) => {
    const importCourse = async (data) => {
        try {
            const response = await axios.post('/admin/importCourse', { data });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data.error || 'Failed to import course data');
        }
    };

    return useMutation(importCourse, {
        onSuccess: (data) => {
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error) => {
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        },
    });
};

export { AdminProvider, useDelBranchMutation, useAddBranchMutation, useAddProfMutation, useUpdateProfMutation, useDeleteProfMutation, useImportCourseMutation };
