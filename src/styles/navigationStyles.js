import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const navigationStyles = StyleSheet.create({
  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // NEW: Header Actions
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerActionButton: {
    padding: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
  },

  profileButton: {
    padding: 5,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextSmall: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 12,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});
