import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isSmall = width < 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={["#e53935", "#ff7043"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.userCircle}>
                <MaterialIcons name="person" size={20} color="#fff" />
              </View>
              {!isSmall && <Text style={styles.headerGreeting}>Welcome back</Text>}
            </View>
          </View>
          <View style={[styles.searchBar, isSmall && styles.searchBarMobile]}>
            <MaterialIcons name="search" size={20} color="#fff" />
            <Text style={styles.searchPlaceholder}>Search users, reports, cases...</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard icon="list-alt" label="Total cases" value="24" color="#1e88e5"
           onPress={() => router.push('/screens/emergency_cases/EmergencyCasesScreen')} />
          <StatCard icon="hourglass-empty" label="Pending" value="5" color="#fb8c00"
           onPress={() => router.push('/screens/emergency_cases/EmergencyCasesScreen')} />
          <StatCard icon="check-circle" label="Resolved" value="2" color="#43a047"
           onPress={() => router.push('/screens/emergency_cases/EmergencyCasesScreen')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.list}>
            <TouchableOpacity onPress={() => router.push('/screens/user_list/UserListScreen')}>
              <ListItem icon="person" title="User Account" subtitle="Manage user profiles" color="red" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/screens/add_user/AddUserScreen')}>
              <ListItem icon="person-add" title="Add User" subtitle="Register a new user" color="#00c853" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/screens/emergency_cases/EmergencyCasesScreen')}>
              <ListItem icon="history" title="Emergency Cases" subtitle="View past emergencies" color="#1e88e5" />
            </TouchableOpacity>
          </View>
        </View>

         <View style={styles.alarmContainer}>
            <TouchableOpacity
              style={styles.alarmButton}
              onPress={() => router.push('/screens/send_alarm/SendAlarmScreen')}
              activeOpacity={0.85} >

              <MaterialIcons name="emergency" size={36} color="#fff" />
              <Text style={styles.alarmText}>Send Alarm</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, onPress }: {
  icon: any;
  label: string;
  value: string;
  color: string;
  onPress?: () => void
}) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconPill, { backgroundColor: '#f7f7f7' }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ListItem({ icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
  return (
    <View style={styles.listItem}>
      <View style={[styles.iconPill, { backgroundColor: '#fff3f3' }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#bbb" />
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconPill, { backgroundColor: '#f7f7f7' }]}>
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
     paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerGreeting: {
    color: '#fff',
    fontWeight: '700',
  },
  addUserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addUserPillText: {
    color: '#fff',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchBarMobile: {
    paddingVertical: 8,
  },
  searchPlaceholder: {
    color: '#fff',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  iconPill: {
    padding: 8,
    borderRadius: 999,
    marginBottom: 10,
    marginRight:5
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  statLabel: {
    color: '#777',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#222',
    fontWeight: '700',
    marginBottom: 8,
  },
  list: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  listTitle: {
    color: '#222',
    fontWeight: '600',
  },
  listSubtitle: {
    color: '#777',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionLabel: {
    marginTop: 6,
    color: '#222',
    fontWeight: '600',
  },
  alarmContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  alarmButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  alarmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
