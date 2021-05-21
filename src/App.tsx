import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button, Card, Loader, Table, TableHeader, TableRow, Title, Text, TextField } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import web3Utils from 'web3-utils';

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const headers: TableHeader[] = [
  {
    id: '1',
    label: 'Recipient address'
  },
  {
    id: '2',
    label: 'Ξ (Ether)',
  }
]

type SimpleTransaction = {
  address: string;
  value: string;
};

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();

  function AddressList (props: any) {
    const [submitting, setSubmitting] = useState(false);
    const [transactions, setTransactions] = useState<SimpleTransaction[]>([]);
    const [currentAddress, setCurrentAddress] = useState('');
    const [currentValue, setCurrentValue] = useState('1');

    const addAddress = async (event: any) => {
      const found = transactions.find(element => currentAddress == element.address)
      if (found !== undefined) {
        found.value = (parseFloat(found.value) + parseFloat(currentValue)).toString();
      } else {
        setTransactions(old => [...old, {'address': currentAddress, 'value': currentValue}])
      }
      setCurrentAddress('');
    }

    const handleAddressChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanInput = e.currentTarget?.value?.trim();
      setCurrentAddress(cleanInput)
      if (!cleanInput.length) {
        return;
      }
    }

    const handleValueChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanInput = e.currentTarget?.value?.trim();
      setCurrentValue(cleanInput)
      if (!cleanInput.length) {
        return;
      }
    }

    const handleClickRow = (index: any) => {
      const temp = [...transactions];
      temp.splice(index, 1);
      setTransactions(temp);
    }

    const submitTx = useCallback(async () => {
      setSubmitting(true);
      try {
        const txs = transactions.map((transaction: SimpleTransaction) => {
          return {
            to: transaction.address,
            value: web3Utils.toWei(transaction.value),
            data: '0x',
          }
        });

        const { safeTxHash } = await sdk.txs.send({ txs });
        console.log({ safeTxHash });
        const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
        console.log({ safeTx });
      } catch (e) {
        console.error(e);
      }
      setSubmitting(false);
    }, [transactions, safe, sdk]);

    const rows: TableRow[] = transactions.map((transaction, index) => ({
      id: index.toString(),
      cells: [{ content: transaction.address }, {content: transaction.value}]
    }))

    return (
      <Container>
        {rows.length > 0 ? (
            <Table headers={headers} rows={rows} onRowClick={handleClickRow} />
          ) : (
            <Card>
              <Text size="xl">No recipients yet</Text>
            </Card>
          )}
        <TextField value={currentAddress} label="Enter Address" onChange={handleAddressChanged}/>
        <TextField value={currentValue} label="Enter Value (Ether)" onChange={handleValueChanged}/>
        <Button size="lg" color="primary" onClick={addAddress}>Add Address</Button>
        {submitting ? (
                <>
                  <Loader size="md" />
                  <br />
                  <Button
                    size="lg"
                    color="secondary"
                    onClick={() => {
                      setSubmitting(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="lg" color="primary" onClick={submitTx}>
                  Submit
                </Button>
              )}
      </Container>
    );
  }

  return (
    <Container>
      <Title size="md">Multisend ether</Title>
      <AddressList/>
    </Container>
  );
};

export default App;
