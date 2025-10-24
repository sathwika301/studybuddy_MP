import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Users, Search, RefreshCw,
  Video, Settings, Trash2, Crown
} from "lucide-react";
import CreateStudyGroup from "./CreateStudyGroup";
import { studyGroupsAPI, cache } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";


const StudyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setRefreshing(true);
      setError("");

      const cacheKey = 'study_groups_data';
      const cachedData = cache.get(cacheKey);

      if (cachedData && !forceRefresh) {
        setGroups(cachedData.allGroups && cachedData.allGroups.length > 0 ? cachedData.allGroups : []);
        setMyGroups(cachedData.userGroups || []);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const apiCalls = [
        studyGroupsAPI.getAll({
          page: 1,
          limit: 20,
          search: searchTerm || undefined
        })
      ];

      if (user) {
        apiCalls.push(studyGroupsAPI.getUserGroups());
      }

      const responses = await Promise.allSettled(apiCalls);

      const allGroupsResponse = responses[0];

      let fetchedGroups = [];

      if (allGroupsResponse.status === 'fulfilled') {
        fetchedGroups = allGroupsResponse.value.data.groups || [];
        setGroups(fetchedGroups.length > 0 ? fetchedGroups : []);
      } else {
        console.error('Failed to fetch all groups:', allGroupsResponse.reason);
        setError("⚠️ Failed to fetch study groups. Please try again later.");
        setGroups([]);
      }

      if (user && responses.length > 1) {
        const userGroupsResponse = responses[1];
        if (userGroupsResponse.status === 'fulfilled') {
          const userGroups = userGroupsResponse.value.data.groups || [];
          setMyGroups(userGroups);

          // Update cache with the actual fetched data
          cache.set(cacheKey, {
            allGroups: fetchedGroups,
            userGroups: userGroups,
            timestamp: Date.now()
          });
        }
      } else {
        // Update cache with the actual fetched data
        cache.set(cacheKey, {
          allGroups: fetchedGroups,
          userGroups: myGroups,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError("⚠️ Failed to load study groups. Please check your connection and try again.");
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  const handleRefresh = () => {
    cache.clear('study_groups_data');
    fetchData(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setMyGroups([newGroup, ...myGroups]);
    setShowCreateModal(false);
  };

  const handleDeleteItem = async (id, type) => {
    if (type === 'group') {
      try {
        await studyGroupsAPI.delete(id);
        setGroups(groups.filter(group => group._id !== id));
        setMyGroups(myGroups.filter(group => group._id !== id));
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert('Failed to delete group');
      }
    }
  };

  const startVideoCall = (groupId) => {
    alert(`Starting video call for group ${groupId}`);
    // Implement actual video call functionality here
  };

  const getUserRole = (group) => {
    if (!user) return null;
    const member = group.members?.find(m => m.user._id === user._id);
    return member?.role;
  };

  const isGroupAdmin = (group) => {
    return getUserRole(group) === 'admin';
  };

  const filteredGroups = groups.filter((group) => {
    return (
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'} px-4 py-8`}>
      <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Connect and learn together</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>
      </div>



      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search groups by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group cursor-pointer"
              onClick={() => {
                navigate(`/study-groups/${group._id}/details`);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{group.subject}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{group.members?.length || 0}</span>
                  </div>
                  {isGroupAdmin(group) && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                {group.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </span>
                {group.isPrivate && (
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Private</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startVideoCall(group._id);
                  }}
                  className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/study-groups/${group._id}/details`);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {group.isDummy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(group._id, 'group');
                      }}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Items Found */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No groups found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or create a new group!
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transition-all transform scale-95 hover:scale-100 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateStudyGroup onGroupCreated={handleGroupCreated} onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}


      </div>
    </div>
  );
};

export default StudyGroupsPage;
