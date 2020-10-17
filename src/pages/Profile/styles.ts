import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.ScrollView`
    flex: 1;
    padding: 10px 30px ${Platform.OS === 'android' ? 140 : 40}px;
`;

export const Title = styled.Text`
    font-size: 20px;
    color: #f4ede8;
    font-weight: 500;
    font-family: serif;
    margin: 24px 0;
`;

export const BackButton = styled.TouchableOpacity`
    margin-top: 12px;
`;

export const UserAvatarButton = styled.TouchableOpacity`
     margin-top: 12px;
`;

export const UserAvatar = styled.Image`
    width: 186px;
    height: 186px;
    border-radius: 98px;

    align-self: center;
`;



