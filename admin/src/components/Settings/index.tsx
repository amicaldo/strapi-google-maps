import React, { useState, useEffect } from 'react';
import pluginId from '../../pluginId';
import {
  Main,
  ContentLayout,
  HeaderLayout,
  Layout,
  Loader,
  TextInput,
  Box,
  Button,
  Link,
  Grid,
  GridItem,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';
import useConfig from '../../hooks/useConfig';
import { AnErrorOccurred } from '@strapi/helper-plugin';
import { Config, UpdateConfig } from '../../../../types';

export default function Settings() {
  const [saveConfig, setSaveConfig] = useState<UpdateConfig | undefined>();

  const [inputFields, setInputFields] = useState<UpdateConfig | undefined>();

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const config = useConfig(saveConfig);

  useEffect(() => {
    if (!!config) {
      setInputFields(config);
    }
  }, [config]);

  useEffect(() => {
    if (!inputFields || !config) return;

    const inputFieldChanged = Object.entries(inputFields).some(
      ([key, value]) => value !== config[key as keyof Config]
    );

    setUnsavedChanges(inputFieldChanged);
  }, [inputFields]);

  const onSave = () => {
    setUnsavedChanges(false);

    setSaveConfig(inputFields);
  };

  return (
    <Box background='neutral100'>
      <Layout>
        <Main aria-busy={config === undefined}>
          <HeaderLayout
            primaryAction={
              <Button
                startIcon={<Check />}
                loading={config === undefined}
                disabled={!unsavedChanges}
                onClick={onSave}
              >
                Save
              </Button>
            }
            title='Google Maps Configuration'
            subtitle='Configure your Google Maps API key and other settings'
          />

          <ContentLayout>
            {config === null ? (
              <AnErrorOccurred
                content={{
                  id: `${pluginId}.error`,
                  defaultMessage: 'An error occurred',
                }}
              />
            ) : config === undefined || !inputFields ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader />
              </div>
            ) : (
              <Box
                shadow='tableShadow'
                background='neutral0'
                paddingTop={6}
                paddingLeft={7}
                paddingRight={7}
                paddingBottom={6}
                hasRadius
              >
                <TextInput
                  type='password'
                  id='apiKey'
                  name='apiKey'
                  placeholder='Paste your Google Maps API key here'
                  label='API Key'
                  value={inputFields.googleMapsKey}
                  onChange={(e: any) => {
                    setInputFields({
                      ...inputFields,
                      googleMapsKey: e.target.value,
                    });
                  }}
                />

                <Grid>
                  <GridItem col={5} padding={2}>
                    <Link
                      href='https://developers.google.com/maps/documentation/javascript/cloud-setup'
                      isExternal
                    >
                      Get your Google Maps API key
                    </Link>
                  </GridItem>

                  <GridItem col={5} padding={2}>
                    <Link
                      href='https://developers.google.com/maps/documentation/javascript/places'
                      isExternal
                    >
                      Grant your API key access to the Google Places API
                    </Link>
                  </GridItem>
                </Grid>
              </Box>
            )}
          </ContentLayout>
        </Main>
      </Layout>
    </Box>
  );
}
