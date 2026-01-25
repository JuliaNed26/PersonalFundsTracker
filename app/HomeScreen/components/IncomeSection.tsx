import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import { IncomeSourceData } from '../../../src/models/data/IncomeSourceData';
import { useState, useEffect } from 'react';
import { deleteIncomeByIdAsync } from '../../../src/db/Repositories/IncomeRepository';
import Modal from '../../components/Modal';
import { useRouter } from 'expo-router';

interface IncomeSectionProps {
  incomes: IncomeSourceData[];
  setSelectedIncome: (income: IncomeSourceData | null) => void;
  onRefresh?: () => Promise<void> | void;
  selectedIncome: IncomeSourceData | null;
}

export default function IncomeSection({ incomes, onRefresh, setSelectedIncome, selectedIncome }: IncomeSectionProps) {
  const router = useRouter();
  const [incomesModalOpen, setIncomesModalOpen] = useState(false);
  const [deleteIncomeModalOpen, setDeleteIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<IncomeSourceData | null>(null);

  useEffect(() => {}, [selectedIncome]);

  async function handleOnLongPress(income: IncomeSourceData) {
    setIncomesModalOpen(true);
    setIncomeToEdit(income);
  }

  async function handleDeleteActionAccepted() {
    setIncomesModalOpen(false);
    setDeleteIncomeModalOpen(true); 
  }

  async function handleDeleteIncome() {
    if (incomeToEdit)
    {
      try 
      {
        await deleteIncomeByIdAsync(incomeToEdit.id);
        setDeleteIncomeModalOpen(false);
        if (onRefresh) await onRefresh();
      } 
      catch (err) 
      {
        console.error('Failed to delete income', err);
      }
    }
  }

  async function handleUpdateIncome() {
    setIncomesModalOpen(false);
    router.push({
      pathname: '/IncomeUpdateScreen',
      params: { incomeId: incomeToEdit?.id }
    });
  }

  function handleIncomePress(income: IncomeSourceData) {
    if (selectedIncome?.id === income.id)
    {
      setSelectedIncome(null);
    }
    else 
    {
      setSelectedIncome(income);
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Incomes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {incomes.map((income) => (
          <Pressable
            key={income.id}
            onLongPress={() => handleOnLongPress(income)}
            onPress={() => handleIncomePress(income)}
            style={selectedIncome?.id === income.id ? styles.highlightedItem : null}>
            <CircleItem key={income.id} name={income.name} balance={income.balance} currency={income.currency} color="green" />
          </Pressable>
        ))}
        <AddButton linkToAddPage="/IncomeAddScreen" />
      </ScrollView>

      <View style={styles.divider} />
      
      <Modal
        visible={incomesModalOpen}
        setIsVisible={setIncomesModalOpen} 
        text={`What do you want to do with the income source ${incomeToEdit?.name}?`} 
        firstButtonText='Update'
        firstButtonAction={handleUpdateIncome}
        secondButtonText='Delete'
        secondButtonAction={handleDeleteActionAccepted}/>
      
      <Modal
        visible={deleteIncomeModalOpen}
        setIsVisible={setDeleteIncomeModalOpen}
        text={`Are you sure you want to delete income ${incomeToEdit?.name}?`} 
        firstButtonText='Cancel'
        firstButtonAction={() => {setDeleteIncomeModalOpen(false)}}
        secondButtonText='Yes'
        secondButtonAction={handleDeleteIncome}/>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
    paddingTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingRight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  highlightedItem: {
    opacity: 0.6,
  },
});
