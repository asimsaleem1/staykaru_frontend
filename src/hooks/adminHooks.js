import { useState, useEffect, useCallback } from 'react';
import adminApiService from '../services/adminApiService';

// Admin Authentication Hook
export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await adminApiService.checkAuthStatus();
            if (response.success && response.data.user) {
                setIsAuthenticated(true);
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await adminApiService.login(credentials);
            if (response.success) {
                setIsAuthenticated(true);
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await adminApiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuthStatus,
    };
};

// Admin Analytics Hook
export const useAdminAnalytics = (timeRange = '30d') => {
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApiService.getAnalytics({ timeRange });
            
            if (response.success) {
                setAnalytics(response.data);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    return {
        analytics,
        loading,
        error,
        refresh: loadAnalytics,
    };
};

// User Management Hook
export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    const loadUsers = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const mergedFilters = { ...filters, ...newFilters };
            setFilters(mergedFilters);
            
            const response = await adminApiService.getUsers(mergedFilters);
            
            if (response.success) {
                setUsers(response.data.users || []);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const updateUser = async (userId, updates) => {
        try {
            const response = await adminApiService.updateUser(userId, updates);
            if (response.success) {
                setUsers(prev => prev.map(user => 
                    user.id === userId ? { ...user, ...updates } : user
                ));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const bulkUpdateUsers = async (userIds, updates) => {
        try {
            const response = await adminApiService.bulkUpdateUsers(userIds, updates);
            if (response.success) {
                setUsers(prev => prev.map(user => 
                    userIds.includes(user.id) ? { ...user, ...updates } : user
                ));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return {
        users,
        loading,
        error,
        filters,
        loadUsers,
        updateUser,
        bulkUpdateUsers,
        setFilters,
    };
};

// Content Moderation Hook
export const useContentModeration = () => {
    const [moderationQueue, setModerationQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadModerationQueue = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApiService.getModerationQueue(filters);
            
            if (response.success) {
                setModerationQueue(response.data.items || []);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const moderateContent = async (itemId, action, reason = null) => {
        try {
            const response = await adminApiService.moderateContent(itemId, { 
                action, 
                reason 
            });
            
            if (response.success) {
                setModerationQueue(prev => 
                    prev.filter(item => item.id !== itemId)
                );
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        loadModerationQueue();
    }, [loadModerationQueue]);

    return {
        moderationQueue,
        loading,
        error,
        loadModerationQueue,
        moderateContent,
    };
};

// Financial Management Hook
export const useFinancialManagement = (timeRange = '30d') => {
    const [financialData, setFinancialData] = useState({
        metrics: {},
        revenue: [],
        transactions: [],
        payouts: [],
        commission: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadFinancialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [metricsRes, revenueRes, transactionsRes, payoutsRes, commissionRes] = 
                await Promise.all([
                    adminApiService.getFinancialMetrics({ timeRange }),
                    adminApiService.getRevenueData({ timeRange }),
                    adminApiService.getTransactionHistory({ timeRange }),
                    adminApiService.getPayoutHistory({ timeRange }),
                    adminApiService.getCommissionData({ timeRange }),
                ]);

            setFinancialData({
                metrics: metricsRes.success ? metricsRes.data : {},
                revenue: revenueRes.success ? revenueRes.data.chartData || [] : [],
                transactions: transactionsRes.success ? transactionsRes.data.transactions || [] : [],
                payouts: payoutsRes.success ? payoutsRes.data.payouts || [] : [],
                commission: commissionRes.success ? commissionRes.data.chartData || [] : [],
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    const processPayout = async (payoutId) => {
        try {
            const response = await adminApiService.processPayout(payoutId);
            if (response.success) {
                setFinancialData(prev => ({
                    ...prev,
                    payouts: prev.payouts.map(payout =>
                        payout.id === payoutId 
                            ? { ...payout, status: 'processing' }
                            : payout
                    )
                }));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        loadFinancialData();
    }, [loadFinancialData]);

    return {
        ...financialData,
        loading,
        error,
        refresh: loadFinancialData,
        processPayout,
    };
};

// System Settings Hook
export const useSystemSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApiService.getSystemSettings();
            
            if (response.success) {
                setSettings(response.data.settings || {});
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (category, newSettings) => {
        try {
            setSaving(true);
            const response = await adminApiService.updateSystemSettings({
                category,
                settings: newSettings
            });
            
            if (response.success) {
                setSettings(prev => ({
                    ...prev,
                    [category]: newSettings
                }));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    return {
        settings,
        loading,
        saving,
        error,
        updateSettings,
        refresh: loadSettings,
    };
};

// Real-time Updates Hook
export const useRealtime = (endpoint, interval = 30000) => {
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let intervalId;
        let isActive = true;

        const fetchData = async () => {
            try {
                setError(null);
                const response = await adminApiService.getRealTimeData(endpoint);
                
                if (response.success && isActive) {
                    setData(response.data);
                    setConnected(true);
                } else if (!response.success) {
                    setError(response.error);
                    setConnected(false);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message);
                    setConnected(false);
                }
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling
        if (interval > 0) {
            intervalId = setInterval(fetchData, interval);
        }

        return () => {
            isActive = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [endpoint, interval]);

    return {
        data,
        connected,
        error,
    };
};

// Reports Hook
export const useReports = () => {
    const [reports, setReports] = useState({
        metrics: {},
        available: [],
        scheduled: [],
        exports: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [metricsRes, availableRes, scheduledRes, exportsRes] = 
                await Promise.all([
                    adminApiService.getReportsMetrics(),
                    adminApiService.getAvailableReports(),
                    adminApiService.getScheduledReports(),
                    adminApiService.getRecentExports(),
                ]);

            setReports({
                metrics: metricsRes.success ? metricsRes.data : {},
                available: availableRes.success ? availableRes.data.reports || [] : [],
                scheduled: scheduledRes.success ? scheduledRes.data.scheduled || [] : [],
                exports: exportsRes.success ? exportsRes.data.exports || [] : [],
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateReport = async (config) => {
        try {
            const response = await adminApiService.generateReport(config);
            if (response.success) {
                loadReports(); // Refresh data
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const scheduleReport = async (config) => {
        try {
            const response = await adminApiService.scheduleReport(config);
            if (response.success) {
                loadReports(); // Refresh data
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteScheduledReport = async (scheduleId) => {
        try {
            const response = await adminApiService.deleteScheduledReport(scheduleId);
            if (response.success) {
                setReports(prev => ({
                    ...prev,
                    scheduled: prev.scheduled.filter(s => s.id !== scheduleId)
                }));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    return {
        ...reports,
        loading,
        error,
        generateReport,
        scheduleReport,
        deleteScheduledReport,
        refresh: loadReports,
    };
};

// Admin Dashboard Summary Hook
export const useAdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        metrics: {},
        chartData: {},
        recentActivity: [],
        quickStats: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [analyticsRes, activityRes] = await Promise.all([
                adminApiService.getAnalytics({ timeRange: '30d' }),
                adminApiService.getRecentActivity({ limit: 10 }),
            ]);

            if (analyticsRes.success) {
                setDashboardData(prev => ({
                    ...prev,
                    metrics: analyticsRes.data.metrics || {},
                    chartData: analyticsRes.data.chartData || {},
                    quickStats: analyticsRes.data.quickStats || {},
                }));
            }

            if (activityRes.success) {
                setDashboardData(prev => ({
                    ...prev,
                    recentActivity: activityRes.data.activities || [],
                }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
        
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    return {
        ...dashboardData,
        loading,
        error,
        refresh: loadDashboardData,
    };
};
