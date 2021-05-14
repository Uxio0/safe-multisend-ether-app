import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button, Loader, Title, TextField } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();

  function AddressList (props: any) {
    const [submitting, setSubmitting] = useState(false);
    const [addresses, setAddresses] = useState<string[]>([]);
    const [currentAddress, setCurrentAddress] = useState('');

    const addAddress = async (event: any) => {
      setAddresses(oldAddresses => [...oldAddresses, currentAddress])
    }

    const handleAddressChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanInput = e.currentTarget?.value?.trim();
      setCurrentAddress(cleanInput)
      if (!cleanInput.length) {
        return;
      }
    }

    const submitTx = useCallback(async () => {
      setSubmitting(true);
      console.log('log', addresses);
      try {
        const txs = addresses.map((address: any) => {
          return {
            to: address,
            value: '1',
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
    }, [addresses, safe, sdk]);

    const listAddresses = addresses.map((address: any) =>
      <li key={address}>{address}</li>
    );

    console.log(addresses)

    return (
      <Container>
        <ul>{listAddresses}</ul>
        <TextField value={currentAddress} label="Enter Address" onChange={e => setCurrentAddress(e.target.value)}/>
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
      <Title size="md">{safe.safeAddress}</Title>
      <AddressList/>
    </Container>
  );
};

export default App;
