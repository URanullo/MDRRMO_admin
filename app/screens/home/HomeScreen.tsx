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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={["#e53935", "#ff7043"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.userCircle}>
                <MaterialIcons name="person" size={20} color="#fff" />
              </View>
              {!isSmall && (
                <View>
                  <Text style={styles.headerGreeting}>{greeting}</Text>
                  <Text style={styles.headerSubGreeting}>Welcome back</Text>
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
              placeholderTextColor="rgba(255,255,255,0.9)"
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

        <View style={styles.statsRow}>
          <StatCard icon="assignment" label="Open Cases" value="5" color="#fb8c00" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionButton icon="person" label="User Accounts" color="#e53935" onPress={() => router.push('/screens/user_list/UserListScreen')} />
            <ActionButton icon="person-add" label="Add User" color="#00c853" onPress={() => router.push('/screens/add_user/AddUserScreen')} />
            <ActionButton icon="history" label="Emergency History" color="#ff9800" onPress={() => router.push('/screens/home/EmergencyHistory')} />
          </View>
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => router.push('/screens/send_alarm/SendAlarmScreen')} activeOpacity={0.9}>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconPill, { backgroundColor: '#f7f7f7' }]}> 
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: color, width: '60%' }]} />
      </View>
    </View>
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
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={[color, '#333']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradient}>
        <View style={[styles.iconPill, { backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 0 }]}> 
          <MaterialIcons name={icon} size={18} color="#fff" />
        </View>
        <Text style={[styles.actionLabel, { color: '#fff' }]}>{label}</Text>
      </LinearGradient>
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
  headerSubGreeting: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 12,
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
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 6,
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
  progressTrack: {
    marginTop: 10,
    height: 6,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    marginTop: 2,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
  },
});
