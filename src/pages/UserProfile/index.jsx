import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { useEffect, useState } from "react";
import {
  getUserCardSetCount,
  getCompletedQuizzesCount,
} from "../../utils/api.js";

function UserProfile() {
  const { user, setUser, loading } = useUser();
  const [cardSetCount, setCardSetCount] = useState(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        const cardSetCountPromise = getUserCardSetCount(user.userId);
        const quizCountPromise = getCompletedQuizzesCount(user.userId);

        const [cardSetCount, quizCount] = await Promise.all([
          cardSetCountPromise,
          quizCountPromise,
        ]);

        setCardSetCount(cardSetCount);
        setCompletedQuizCount(quizCount);
      };

      fetchCounts();
    }
  }, [user]);

  if (!user || loading)
    return (
      <>
        <div>Loading...</div>
      </>
    );
  return (
    <Wrapper>
      <Title>用戶總覽</Title>
      <Split />
      <ProfileSection>
        <ProfilePictureContainer>
          <ProfilePicture src={user.profilePicture} />
        </ProfilePictureContainer>
        <AccountInfo>
          <AccountInfoItem>{`Email: ${user.email}`}</AccountInfoItem>
          <AccountInfoItem>{`用戶名: ${user.username}`}</AccountInfoItem>
          <AccountInfoItem>
            {cardSetCount === null
              ? "卡牌組數量加載中..."
              : `卡牌組數量: ${cardSetCount}`}
          </AccountInfoItem>
          <AccountInfoItem>
            {completedQuizCount === null
              ? "完成測驗數加載中..."
              : `完成測驗數: ${completedQuizCount}`}
          </AccountInfoItem>
        </AccountInfo>
      </ProfileSection>
      <Split />
    </Wrapper>
  );
}

export default UserProfile;

const Wrapper = styled.div`
  margin-top: 80px;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 28px;
`;

const Split = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
`;

const ProfileSection = styled.div`
  display: flex;
  width: 100%;
  padding: 8px 0;
`;

const ProfilePictureContainer = styled.div`
  height: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePicture = styled.img`
  height: 160px;
  width: 160px;
  border-radius: 50%;
  object-fit: cover;
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 8%;
  justify-content: space-around;
`;

const AccountInfoItem = styled.p`
  font-size: 16px;
`;
