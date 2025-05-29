import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const componentStyles = StyleSheet.create({
  // Enhanced Class Card Styles
  classCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  bookedClassCard: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '05',
  },
  fullClassCard: {
    opacity: 0.6,
    borderColor: colors.textSecondary + '40',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  classStatusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  classInstructor: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  classDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bookedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  classTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  classDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  classPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  // Availability Status
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spotsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotsLeft: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Action Buttons
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookedButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
  },
  bookButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookedButtonText: {
    color: colors.success,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },

  // Booked State Actions
  bookedActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    gap: 6,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  cancelActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 10,
    gap: 6,
  },
  cancelActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },

  // Special Indicators
  popularIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  newIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
  },
});