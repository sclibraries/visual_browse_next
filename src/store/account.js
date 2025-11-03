const initialState = {
    collections: [],
    newCollection: {
        name: '',
        description: '',
        isPublic: false,
    },
    collectionRecords: [],
    loggedIn: false,
    authChecked: false,
    baseUrl: 'https://libtools2.smith.edu:4000',
    collectionRecordId: '',
    collectionRecordName: '',
    user: [],
    favorites: [],
    collectionCoverImage: '',
    // Admin customization state: maps college identifier -> array of collection_ids for home page display
    collegeHomeSelections: {},
    // List of colleges (ids/names) the admin can manage
    colleges: [],
    selectedCollegeId: '',
    // Analytics state
    analyticsData: null,
    analyticsLoading: false,
    analyticsError: null,
    collectionAnalytics: {},
}


export const createAccountStore = (set) => ({
    ...initialState,
    setCollections: (collections) => set(() => ({ collections })),
    setNewCollection: (newCollection) => set(() => ({ newCollection })),
    setCollectionRecords: (collectionRecords) => set(() => ({ collectionRecords })),
    resetNewCollection: () => set(() => ({ newCollection: initialState.newCollection })),
    resetCollectionRecords: () => set(() => ({ collectionRecords: initialState.collectionRecords })),
    addCollection: (collection) => set((state) => ({ collections: [collection, ...state.collections] })),
    removeCollection: (collectionId) => {
        set((state) => ({
            collections: state.collections.filter(collection => collection.id !== collectionId),
        }))
    },
    updateCollection: (collectionId, updatedCollection) => {
        set((state) => ({
          collections: state.collections.map((collection) => {
            if (collection.collection_id === collectionId) {
              return { ...collection, ...updatedCollection };
            }
            console.log(collection)
            return collection;
          }),
        }));
      },
    updateNewCollection: (updatedCollection) => {
        set((state) => ({
            newCollection: {
                ...state.newCollection,
                ...updatedCollection,
            },
        }))
    },
    updateCollectionRecords: (collectionRecords) => {
        set(() => ({
            collectionRecords: collectionRecords
        }))
    },
    removeCollectionRecord: (recordId) => {
        set((state) => ({
            collectionRecords: state.collectionRecords.filter(record => record.id !== recordId),
        }))
    },
    addCollectionRecord: (record) => {
        set((state) => ({
            collectionRecords: [...state.collectionRecords, record]
        }))
    },
    setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
    setAuthChecked: (authChecked) => set(() => ({ authChecked })),
    setCollectionRecordId: (collectionRecordId) => set(() => ({ collectionRecordId })),
    setCollectionRecordName: (collectionRecordName) => set(() => ({ collectionRecordName })),
    setUser: (user) => set(() => ({ user })),
    setFavorites: (favorites) => set(() => ({ favorites })),
    setCollectionCoverImage: (collectionCoverImage) => set({ collectionCoverImage }),
    // Admin customization actions
    setColleges: (colleges) => set(() => ({ colleges })),
    setSelectedCollegeId: (selectedCollegeId) => set(() => ({ selectedCollegeId })),
    setCollegeHomeSelections: (collegeId, collectionIds) => set((state) => ({
        collegeHomeSelections: {
            ...state.collegeHomeSelections,
            [collegeId]: collectionIds
        }
    })),
    addCollectionToCollegeSelection: (collegeId, collectionId) => set((state) => {
        const current = state.collegeHomeSelections[collegeId] || [];
        if (current.includes(collectionId)) return {};
        return {
            collegeHomeSelections: {
                ...state.collegeHomeSelections,
                [collegeId]: [...current, collectionId]
            }
        };
    }),
    removeCollectionFromCollegeSelection: (collegeId, collectionId) => set((state) => {
        const current = state.collegeHomeSelections[collegeId] || [];
        return {
            collegeHomeSelections: {
                ...state.collegeHomeSelections,
                [collegeId]: current.filter(id => id !== collectionId)
            }
        };
    }),
    reorderCollegeSelection: (collegeId, fromIndex, toIndex) => set((state) => {
        const current = [...(state.collegeHomeSelections[collegeId] || [])];
        if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) return {};
        const [moved] = current.splice(fromIndex, 1);
        current.splice(toIndex, 0, moved);
        return {
            collegeHomeSelections: {
                ...state.collegeHomeSelections,
                [collegeId]: current
            }
        };
    }),
    // Analytics actions
    setAnalyticsData: (analyticsData) => set(() => ({ analyticsData })),
    setAnalyticsLoading: (analyticsLoading) => set(() => ({ analyticsLoading })),
    setAnalyticsError: (analyticsError) => set(() => ({ analyticsError })),
    setCollectionAnalytics: (collectionId, analytics) => set((state) => ({
        collectionAnalytics: {
            ...state.collectionAnalytics,
            [collectionId]: analytics
        }
    })),
    clearAnalytics: () => set(() => ({ 
        analyticsData: null, 
        analyticsError: null,
        collectionAnalytics: {}
    })),
    accountReset: () => set({ ...initialState })
})