import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  const [searchQuery, setSearchQuery] = useState('');

  type ActivityItem = {
    id: string;
    status: 'Case Escalated' | 'Responder Assigned' | 'Case Closed' | 'Update';
    emergencyType: string;
    location: string;
    dateTime?: string;
  };

  const activities: ActivityItem[] = useMemo(() => ([
    { id: 'a1', status: 'Case Escalated', emergencyType: 'Landslide', location: 'Poblacion', dateTime: '2025-09-15T14:30:00Z' },
    { id: 'a2', status: 'Responder Assigned', emergencyType: 'Fire', location: 'Campo', dateTime: '2025-09-15T15:10:00Z' },
    { id: 'a3', status: 'Case Closed', emergencyType: 'Accident', location: 'Cabugao', dateTime: '2025-09-15T16:05:00Z' },
  ]), []);

  const getStatusMeta = (status: ActivityItem['status']) => {
    switch (status) {
      case 'Case Escalated':
        return { icon: 'arrow-upward', color: '#d32f2f' };
      case 'Responder Assigned':
        return { icon: 'person-add', color: '#1976d2' };
      case 'Case Closed':
        return { icon: 'check-circle', color: '#388e3c' };
      default:
        return { icon: 'update', color: '#6d4c41' };
    }
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return dateTime;
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient 
          colors={["#b71c1c", "#e53935", "#ff7043"]} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.userCircle}>
                <MaterialIcons name="person" size={20} color="#fff" />
              </View>
              {!isSmall && (
                <View>
                  <Text style={styles.headerGreeting}>{greeting}</Text>
                  <Text style={styles.headerSubGreeting}>Stay alert. Stay safe.</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.searchBar, isSmall && styles.searchBarMobile]}>
            <MaterialIcons name="search" size={20} color="#fff" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users, reports, cases..."
              placeholderTextColor="rgba(255,255,255,0.85)"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="assignment"
              label="Open Cases"
              color="#d32f2f"
              onPress={() => {}}
              containerStyle={styles.actionTile}
              value="5"
            />
            <ActionButton 
              icon="person" 
              label="User Accounts" 
              color="#c62828" 
              onPress={() => router.push('/screens/user_list/UserListScreen')} 
              containerStyle={styles.actionTile} 
            />
            <ActionButton 
              icon="history" 
              label="Emergency History" 
              color="#ad1457" 
              onPress={() => router.push('/screens/EmergencyListScreen/EmergencyHistory')} 
              containerStyle={styles.actionTile} 
            />
            <ActionButton 
              icon="person-add" 
              label="Add User" 
              color="#bf360c" 
              onPress={() => router.push('/screens/add_user/AddUserScreen')} 
              containerStyle={styles.actionTile} 
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {activities.length === 0 ? (
              <View style={styles.activityEmpty}>
                <MaterialIcons name="inbox" size={40} color="#ccc" />
                <Text style={styles.activityEmptyText}>No recent activity</Text>
              </View>
            ) : (
              activities.map((item) => {
                const meta = getStatusMeta(item.status);
                return (
                  <View key={item.id} style={[styles.activityCard, item.status === "Case Escalated" && styles.activityCardEscalated]}>
                    <View style={[styles.activityIconWrap, { backgroundColor: meta.color + '20' }]}>
                      <MaterialIcons name={meta.icon as any} size={20} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.activityHeader}>
                        <Text style={[styles.activityStatus, { color: meta.color }]}>{item.status}</Text>
                        {!!item.dateTime && (
                          <Text style={styles.activityDate}>{formatDateTime(item.dateTime)}</Text>
                        )}
                      </View>
                      <Text style={styles.activityType}>{item.emergencyType}</Text>
                      <View style={styles.activityLocationRow}>
                        <MaterialIcons name="location-on" size={14} color="#888" />
                        <Text style={styles.activityLocation}>{item.location}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push('/screens/send_alarm/SendAlarmScreen')} 
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#d32f2f", "#b71c1c"]} style={styles.fabInner}>
            <MaterialIcons name="notification-important" size={22} color="#fff" />
            <Text style={styles.fabText}>Send Alarm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, color, onPress, containerStyle, value }: { icon: any; label: string; color: string; onPress: () => void; containerStyle?: any; value?: string }) {
  return (
    <TouchableOpacity style={[styles.actionButton, containerStyle]} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={[color, '#6d1b1b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradient}>
        <View style={styles.actionInner}>
          <View style={[styles.iconPill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}> 
            <MaterialIcons name={icon} size={20} color="#fff" />
          </View>
          {!!value && <Text style={styles.actionValue}>{value}</Text>}
          <Text style={styles.actionLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    paddingBottom: 72,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: '#b71c1c',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerGreeting: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  headerSubGreeting: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  searchBarMobile: {
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 6,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#222',
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: '100%',
  },
  actionInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconPill: {
    padding: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  actionLabel: {
    marginTop: 2,
    fontWeight: '600',
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
  },
  actionValue: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    marginTop: 2,
  },
  actionTile: {
    width: '47%',
    minWidth: 140,
    height: 110,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activityCardEscalated: {
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityDate: {
    fontSize: 12,
    color: '#888',
  },
  activityType: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  activityLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  activityEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  activityEmptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
