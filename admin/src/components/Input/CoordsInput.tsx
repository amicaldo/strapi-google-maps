import React, { useEffect } from 'react';
import { Grid, TextInput } from '@strapi/design-system';
import { Coordinates } from '../../../../types';

function generateId(len: number) {
    function dec2hex(dec: number) {
        return dec.toString(16).padStart(2, '0');
    }

    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
}

export default function NumberFields({
    coords,
    onChange,
}: {
    coords: Coordinates;
    onChange: (coords: Coordinates) => void;
}) {
    const windowInputValueDescriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    );
    if (!windowInputValueDescriptor) return null;

    const latInputId = generateId(10);
    const lngInputId = generateId(10);

    const { lat, lng } = coords;

    useEffect(() => {
        const latInput = document.getElementById(latInputId) as HTMLInputElement;
        const lngInput = document.getElementById(lngInputId) as HTMLInputElement;

        const setInputValueNatively = (input: HTMLInputElement, value: number) =>
            windowInputValueDescriptor.set!.call(input, isNaN(value) ? null : value);

        setInputValueNatively(latInput, lat);
        setInputValueNatively(lngInput, lng);

        /* This will trigger a new render for the component */
        const changeEvent = new Event('change', { bubbles: true });
        latInput.dispatchEvent(changeEvent);
        lngInput.dispatchEvent(changeEvent);
    }, [lat, lng]);

    return (
        <Grid.Root gap={3}>
            <Grid.Item col={6}>
                <TextInput
                    id={latInputId}
                    placeholder='Latitude'
                    aria-label='Latitude'
                    hint='Latitude'
                    name='latitude'
                    onChange={(e: any) => {
                        if (!e.target.value) return;
                        onChange({ lat: Number(e.target.value), lng });
                    }}
                    size='S'
                />
            </Grid.Item>

            <Grid.Item col={6}>
                <TextInput
                    id={lngInputId}
                    placeholder='Longtitude'
                    aria-label='Longtitude'
                    hint='Longtitude'
                    name='longtitude'
                    onChange={(e: any) => {
                        if (!e.target.value) return;
                        onChange({ lat, lng: Number(e.target.value) });
                    }}
                    size='S'
                />
            </Grid.Item>
        </Grid.Root>
    );
}