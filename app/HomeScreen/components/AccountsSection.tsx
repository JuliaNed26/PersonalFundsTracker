import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import CircleItem from './CircleItem';
import AddButton from './AddButton';
import { AccountData } from '../../../src/models/data/AccountData';
import Modal from '../../components/Modal';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { deleteAccountAsync } from '../../../src/db/Repositories/AccountRepositiory';

interface AccountsSectionProps {
  accounts: AccountData[];
  onRefresh?: () => Promise<void> | void;
}

export default function AccountsSection({ accounts, onRefresh }: AccountsSectionProps) {
  var router = useRouter();
  const [accountsModalOpen, setAccountsModalOpen] = useState<boolean>(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState<boolean>(false);
  const [pressedAccount, setPressedAccount] = useState<AccountData | null>(null);

  async function handleOnLongPress(account : AccountData) {
    setAccountsModalOpen(true);
    setPressedAccount(account);
  }

  async function handleUpdateAccount() {
    router.push({
      pathname: '/AccountUpdateScreen',
      params: { accountId: pressedAccount?.id}
    });
    setAccountsModalOpen(false);
  }

  async function handleDeleteActionAccepted() {
    setAccountsModalOpen(false);
    setDeleteAccountModalOpen(true);
  }

  async function handleDeleteAccount() {
    try {
      if (!pressedAccount){
        return;
      }

      await deleteAccountAsync(pressedAccount.id);
      if (onRefresh) await onRefresh();
      setDeleteAccountModalOpen(false);
    }
    catch(err) {
      console.error('Failed to delete account', err)
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            onLongPress={() => handleOnLongPress(account)}>
            <CircleItem
              name={account.name}
              balance={account.balance}
              currency={account.currency}
              color="orange"
            />
          </Pressable>
        ))}
        <AddButton linkToAddPage="/AccountAddScreen"/>
      </ScrollView>

      <View style={styles.divider} />
      
      <Modal
        visible={accountsModalOpen}
        setIsVisible={setAccountsModalOpen} 
        text={`What do you want to do with the account ${pressedAccount?.name}?`} 
        firstButtonText='Update'
        firstButtonAction={handleUpdateAccount}
        secondButtonText='Delete'
        secondButtonAction={handleDeleteActionAccepted}/>
      
      <Modal
        visible={deleteAccountModalOpen}
        setIsVisible={setDeleteAccountModalOpen}
        text={`Are you sure you want to delete account ${pressedAccount?.name}?`} 
        firstButtonText='Cancel'
        firstButtonAction={() => {setDeleteAccountModalOpen(false)}}
        secondButtonText='Yes'
        secondButtonAction={handleDeleteAccount}/>

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
});
