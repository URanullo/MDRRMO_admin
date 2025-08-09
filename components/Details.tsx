import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Details({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={32} color="#fff" />
            </View>
            <Text style={styles.profileName}>Yover Nullo</Text>
          </View>
          <View style={styles.sidebarMenu}>
            <SidebarItem icon={<Feather name="user" size={20} color="#333" />} label="My details" active />
            <SidebarItem icon={<Feather name="users" size={20} color="#333" />} label="Users" />
            <SidebarItem icon={<Feather name="folder" size={20} color="#333" />} label="Cases" />
            <SidebarItem icon={<Feather name="file-text" size={20} color="#333" />} label="Send Alarm" />
          </View>
          <View style={styles.sidebarFooter}>
            <View style={styles.footerBox}>
              <Text style={styles.footerTitle}>Household</Text>
              <Text style={styles.footerSubtitle}>Emergency Alarm</Text>
              <Text style={styles.footerVersion}>Version: 1.0.0.11</Text>
            </View>
          </View>
        </View>
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <MaterialIcons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.userCircle}>
                <MaterialIcons name="person" size={20} color="#fff" />
              </View>
              <Text style={styles.userName}>Yover Nullo</Text>
            </View>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#888" />
              <Text style={styles.searchText}>Quick search</Text>
            </View>
            <TouchableOpacity style={styles.addUserButton}>
              <Text style={styles.addUserButtonText}>+ Add User</Text>
            </TouchableOpacity>
          </View>
          {/* Dashboard Cards */}
          <ScrollView contentContainerStyle={styles.dashboardScroll}>
            <View style={styles.dashboardRow}>
              {/* Reports Card */}
              <View style={styles.cardLarge}>
                <Text style={styles.cardTitle}>Reports</Text>
                <Text style={styles.cardSubtitle}>Employees</Text>
                {/* Chart with navigation arrows */}
                <View style={styles.chartContainer}>
                  <TouchableOpacity style={styles.chartArrow}>
                    <MaterialIcons name="chevron-left" size={24} color="#ccc" />
                  </TouchableOpacity>
                  <View style={styles.chartArea}>
                    <Text style={styles.chartText}>[Area Chart: 2016-2019]</Text>
                    <View style={styles.chartLegendRow}>
                      <ChartLegend color="#ff9800" label="Campo" />
                      <ChartLegend color="#4caf50" label="Poblacion" />
                      <ChartLegend color="#7c4dff" label="San Francisco" />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.chartArrow}>
                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                  </TouchableOpacity>
                </View>
                <View style={styles.paginationDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
              {/* Statistics Card */}
              <View style={styles.cardLarge}>
                <Text style={styles.cardTitle}>Statistics</Text>
                {/* Donut chart with navigation */}
                <View style={styles.chartContainer}>
                  <TouchableOpacity style={styles.chartArrow}>
                    <MaterialIcons name="chevron-left" size={24} color="#ccc" />
                  </TouchableOpacity>
                  <View style={styles.donutChartArea}>
                    <Text style={styles.chartText}>[Donut Chart]</Text>
                    <Text style={styles.chartLabel}>By emergency type</Text>
                    <View style={styles.statsLegendWrap}>
                      <ChartLegend color="#e53935" label="Accident" />
                      <ChartLegend color="#ffb300" label="Medical" />
                      <ChartLegend color="#8bc34a" label="Assault" />
                      <ChartLegend color="#00bcd4" label="Float" />
                      <ChartLegend color="#7c4dff" label="Earthquake" />
                      <ChartLegend color="#ff4081" label="Fire" />
                      <ChartLegend color="#607d8b" label="Robbery" />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.chartArrow}>
                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                  </TouchableOpacity>
                </View>
                <View style={styles.paginationDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
            <View style={styles.dashboardRow}>
              {/* New Reports Card */}
              <View style={styles.cardSmall}>
                <Text style={styles.cardTitle}>New Reports</Text>
                <View style={styles.emptyStateBox}>
                  <Text style={styles.emptyStateText}>There are no reports yet</Text>
                </View>
              </View>
              {/* Pending Cases Card */}
              <View style={styles.cardSmall}>
                <Text style={styles.cardTitle}>Pending Cases</Text>
                <View style={styles.emptyStateBox}>
                  <Text style={styles.emptyStateText}>There are no action items assigned.</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <View style={[styles.sidebarItem, active && styles.sidebarItemActive]}>
      {icon}
      <Text style={[styles.sidebarItemText, active && styles.sidebarItemTextActive]}>{label}</Text>
    </View>
  );
}

function ChartLegend({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
  },
  // Sidebar
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  sidebarMenu: {
    flex: 1,
    width: '100%',
    marginTop: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#fbe9e7',
  },
  sidebarItemText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  sidebarItemTextActive: {
    color: '#e53935',
    fontWeight: 'bold',
  },
  sidebarFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  footerBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 180,
  },
  footerTitle: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  footerSubtitle: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerVersion: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // Main Content
  mainContent: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f7f7f7',
  },
  topBar: {
    height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  userCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 16,
  },
  searchText: {
    marginLeft: 8,
    color: '#888',
    fontSize: 14,
  },
  addUserButton: {
    backgroundColor: '#00c853',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addUserButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dashboardScroll: {
    padding: 24,
    paddingTop: 16,
  },
  dashboardRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  cardLarge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginRight: 24,
    minWidth: 320,
    maxWidth: 400,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginRight: 24,
    minWidth: 320,
    maxWidth: 400,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: '#222',
  },
  cardSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartArrow: {
    padding: 8,
  },
  chartArea: {
    flex: 1,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartArea: {
    flex: 1,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 4,
  },
  chartLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  chartLegendRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
  },
  statsLegendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: '#555',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 2,
  },
  emptyStateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  emptyStateText: {
    color: '#bbb',
    fontSize: 15,
  },
});
