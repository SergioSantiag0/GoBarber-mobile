import React, {
    useEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
    useState,
    useCallback,
} from 'react';
import { useField } from '@unform/core';
import { TextInputProps } from 'react-native';

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextInputProps {
    name: string;
    icon: string;
    containerStyle?: {},
}

interface InputValueReference {
    value: string;
}

interface InputRef {
    focus(): void;
}

const Input: React.RefForwardingComponent<InputRef, InputProps> = (
    { name, icon, containerStyle = {}, ...rest },
    ref,
) => {
    const { registerField, defaultValue = '', fieldName, error } = useField(
        name,
    );

    const inputElementRef = useRef<any>(null);
    const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

    const [isFocused, setIsFocused] = useState(false);
    const [isField, setIsField] = useState(false);

    const handleInputFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleInputBlur = useCallback(() => {
        setIsFocused(false);

        setIsField(!!inputValueRef.current.value);
    }, []);

    useImperativeHandle(ref, () => ({
        focus() {
            inputElementRef.current.focus();
        },
    }));

    useEffect(() => {
        registerField({
            name: fieldName,
            ref: inputValueRef.current,
            path: 'value',
        });
    }, [fieldName, registerField]);
    return (
        <Container isFocused={isFocused} isErrored={!!error} style={containerStyle}>
            <Icon
                name={icon}
                size={20}
                color={isFocused || isField ? '#FF9000' : '#666360'}
            />
            <TextInput
                ref={inputElementRef}
                {...rest}
                placeholderTextColor="#666360"
                defaultValue={defaultValue}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChangeText={value => {
                    inputValueRef.current.value = value;
                }}
            />
        </Container>
    );
};

export default forwardRef(Input);
