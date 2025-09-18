import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EmergencyReport {
  id: string;
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string;
  contactNumber: string;
  dateTime: string;
  status: 'Pending' | 'Responded' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export default function EmergencyHistory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Responded' | 'Resolved'>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Mock emergency data - in a real app, this would come from Firebase
  const emergencyReports: EmergencyReport[] = useMemo(() => ([
    {
      id: '1',
      type: 'Fire',
      description: 'House fire reported in residential area',
      location: '123 Main Street',
      barangay: 'Poblacion',
      reportedBy: 'Juan Dela Cruz',
      contactNumber: '09123456789',
      dateTime: '2024-01-15 14:30',
      status: 'Resolved',
      priority: 'High'
    },
    {
      id: '2',
      type: 'Flood',
      description: 'Heavy flooding in low-lying areas',
      location: 'Riverside Road',
      barangay: 'Cabugao',
      reportedBy: 'Maria Santos',
      contactNumber: '09876543210',
      dateTime: '2024-01-15 16:45',
      status: 'Responded',
      priority: 'Critical'
    },
    {
      id: '3',
      type: 'Medical Emergency',
      description: 'Person collapsed in public area',
      location: 'Market Square',
      barangay: 'Campo',
      reportedBy: 'Pedro Rodriguez',
      contactNumber: '09111222333',
      dateTime: '2024-01-15 18:20',
      status: 'Pending',
      priority: 'High'
    },
    {
      id: '4',
      type: 'Traffic Accident',
      description: 'Two-vehicle collision on highway',
      location: 'Highway 1',
      barangay: 'Dugsangon',
      reportedBy: 'Ana Garcia',
      contactNumber: '09444555666',
      dateTime: '2024-01-14 09:15',
      status: 'Resolved',
      priority: 'Medium'
    },
    {
      id: '5',
      type: 'Landslide',
      description: 'Mudslide blocking main road',
      location: 'Mountain Road',
      barangay: 'Pautao',
      reportedBy: 'Carlos Mendoza',
      contactNumber: '09777888999',
      dateTime: '2024-01-14 11:30',
      status: 'Responded',
      priority: 'Critical'
    },
    {
      id: '6',
      type: 'Power Outage',
      description: 'Electrical failure affecting entire barangay',
      location: 'Multiple areas',
      barangay: 'Santo Rosario',
      reportedBy: 'Elena Torres',
      contactNumber: '09222333444',
      dateTime: '2024-01-13 20:00',
      status: 'Resolved',
      priority: 'Medium'
    }
  ]), []);

  const filteredReports = useMemo(() => {
    return emergencyReports.filter(report => {
      const matchesSearch = 
        report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, emergencyReports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#ff9800';
      case 'Responded': return '#2196f3';
      case 'Resolved': return '#4caf50';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'High': return '#f44336';
      case 'Critical': return '#9c27b0';
      default: return '#666';
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire': return 'local-fire-department';
      case 'flood': return 'water';
      case 'medical emergency': return 'medical-services';
      case 'traffic accident': return 'car-crash';
      case 'landslide': return 'terrain';
      case 'power outage': return 'power-off';
      default: return 'warning';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency History</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search emergencies..."
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['All', 'Pending', 'Responded', 'Resolved'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <Text style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{emergencyReports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>
              {emergencyReports.filter(r => r.status === 'Pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#2196f3' }]}>
              {emergencyReports.filter(r => r.status === 'Responded').length}
            </Text>
            <Text style={styles.statLabel}>Responded</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>
              {emergencyReports.filter(r => r.status === 'Resolved').length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No emergency reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No emergency reports have been submitted yet'
              }
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.emergencyTypeContainer}>
                  <View style={[styles.emergencyIcon, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
                    <MaterialIcons 
                      name={getEmergencyIcon(report.type)} 
                      size={20} 
                      color={getPriorityColor(report.priority)} 
                    />
                  </View>
                  <View style={styles.emergencyInfo}>
                    <Text style={styles.emergencyType}>{report.type}</Text>
                    <Text style={styles.emergencyLocation}>{report.barangay}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {report.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>{report.description}</Text>
              
              <View style={styles.reportDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.detailText}>{report.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={16} color="#666" />
                  <Text style={styles.detailText}>{report.reportedBy}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="access-time" size={16} color="#666" />
                  <Text style={styles.detailText}>{formatDateTime(report.dateTime)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="phone" size={16} color="#666" />
                  <Text style={styles.detailText}>{report.contactNumber}</Text>
                </View>
              </View>

              <View style={styles.priorityContainer}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                  <Text style={styles.priorityText}>{report.priority} Priority</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#e53935',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginVertical: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emergencyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  emergencyLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priorityContainer: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
