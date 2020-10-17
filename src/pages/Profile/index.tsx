import React, { useRef, useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
    KeyboardAvoidingView,
    View,
    ScrollView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';

import * as Yup from 'yup';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api'

import Input from '../../components/Input';
import Button from '../../components/Button';

import getValidationErrros from '../../utils/getValidationErrors';

import { Container, Title, UserAvatarButton, UserAvatar, BackButton } from './styles';

import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
    name: string;
    email: string;
    old_password: string;
    password: string;
    password_confirmation: string;
}

const SignUp: React.FC = () => {
    const navigation = useNavigation();

    const { user, updateUser } = useAuth();

    const formRef = useRef<FormHandles>(null);

    const emailInputRef = useRef<TextInput>(null);
    const oldPasswordInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const handleSignUp = useCallback(async (data: ProfileFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome obrigatório'),
                email: Yup.string()
                    .required('E-mail obrigatório')
                    .email('Digite um e-mail válido'),
                old_password: Yup.string(),
                password: Yup.string().when('old_password', {
                    is: val => !!val.length,
                    then: Yup.string().required('Campo obrigatório'),
                    otherwise: Yup.string(),
                }),
                password_confirmation: Yup.string()
                    .when('old_password', {
                        is: val => !!val.length,
                        then: Yup.string().required('Campo obrigatório'),
                        otherwise: Yup.string(),
                    })
                    .oneOf([Yup.ref('password')], 'Confirmação incorreta'),
            });

            const { name, email, old_password, password, password_confirmation } = data;

            const formData = { name, email, ...(old_password ? { old_password, password, password_confirmation } : {}) }

            await schema.validate(data, {
                abortEarly: false,
            });

            const response = await api.put('/profile', formData);

            updateUser(response.data)

            Alert.alert(
                'Perfil atualizado com sucesso!',
            );

            navigation.goBack();

        } catch (err) {
            console.log(err)
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrros(err);

                formRef.current?.setErrors(errors);

                return;
            }
            Alert.alert(
                'Erro na atualização do perfil',
                'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
            );
        }
    }, [navigation, updateUser]);

    const handleUpdateAvatar = useCallback(async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {

            const data = new FormData();

            data.append('avatar', {
                type: 'image/jpg',
                name: `${user.id}.jpeg`,
                uri: result.uri,

            });

            api.patch('/users/avatar', data).then(apiResponse => {
                updateUser(apiResponse.data)
            })
        }

    }, [updateUser, user.id])

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, []);

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                enabled
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Container>
                        <BackButton onPress={handleGoBack}>
                            <Icon name="chevron-left" size={28} color="#999591" />
                        </BackButton>
                        <UserAvatarButton onPress={handleUpdateAvatar}>
                            <UserAvatar source={{ uri: user.avatar_url }} />
                        </UserAvatarButton>

                        <View>
                            <Title>Meu perfil</Title>
                        </View>

                        <Form
                            ref={formRef}
                            onSubmit={handleSignUp}
                            style={{ width: '100%' }}
                            initialData={user}
                        >
                            <Input
                                autoCapitalize="words"
                                name="name"
                                icon="user"
                                placeholder="Nome"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailInputRef.current?.focus();
                                }}
                            />

                            <Input
                                ref={emailInputRef}
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                keyboardType="email-address"
                                returnKeyType="next"
                                autoCorrect={false}
                                autoCapitalize="none"
                                onSubmitEditing={() => {
                                    oldPasswordInputRef.current?.focus();
                                }}
                            />

                            <Input
                                ref={oldPasswordInputRef}
                                secureTextEntry
                                name="old_password"
                                icon="lock"
                                placeholder="Senha atual"
                                textContentType="newPassword"
                                containerStyle={{ marginTop: 16 }}
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    passwordInputRef.current?.focus()}
                            />

                            <Input
                                ref={passwordInputRef}
                                secureTextEntry
                                name="password"
                                icon="lock"
                                placeholder="Nova senha"
                                textContentType="newPassword"
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    confirmPasswordInputRef.current?.focus()}
                            />

                            <Input
                                ref={confirmPasswordInputRef}
                                secureTextEntry
                                name="password_confirmation"
                                icon="lock"
                                placeholder="Confirmar senha"
                                textContentType="newPassword"
                                returnKeyType="send"
                                onSubmitEditing={() =>
                                    formRef.current?.submitForm()}
                            />

                            <Button
                                onPress={() => {
                                    formRef.current?.submitForm();
                                }}
                            >
                                Confirmar mudanças
                            </Button>
                        </Form>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default SignUp;
