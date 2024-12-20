import { Input, message } from "antd";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled, { keyframes } from "styled-components";
import {
  CalendarIcon,
  ProfileEditIcon as EditIcon,
  EditNameIcon,
  ProfileIcon,
  ProfileStarIcon as StarIcon,
} from "../../assets/icons/index.jsx";
import { useUser } from "../../context/UserContext.jsx";
import {
  getCompletedQuizzesCount,
  getUserCardSetCount,
  updateProfilePicture,
  updateUsername,
} from "../../utils/api.js";
import Collection from "./Collection.jsx";

function UserProfile() {
  const { user, setUser, loading } = useUser();
  const [cardSetCount, setCardSetCount] = useState(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(null);
  const [activeDays, setActiveDays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        setActiveDays(user.activeDays);
      };

      fetchCounts();
    }
  }, [user]);

  const handleIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewProfilePicture(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleCancel = () => {
    handleCloseModal();
  };

  const handleSaveProfilePicture = async () => {
    if (newProfilePicture) {
      try {
        const updatedProfilePictureURL = await updateProfilePicture(
          user.userId,
          newProfilePicture
        );

        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: updatedProfilePictureURL,
        }));

        message.success("大頭貼更新成功！");
        handleCloseModal();
      } catch (error) {
        console.error("更新大頭貼失敗", error);
        message.error("更新大頭貼失敗，請稍後再試！");
      }
    }
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleSaveUsername = async () => {
    if (editedUsername && editedUsername !== user.username) {
      try {
        await updateUsername(user.userId, editedUsername);
        setUser((prevUser) => ({
          ...prevUser,
          username: editedUsername,
        }));
        message.success("用戶名已成功更新！");
        setIsEditingName(false);
      } catch (error) {
        console.error("更新用戶名失敗", error);
        message.error("更新用戶名失敗，請稍後再試！");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedUsername(user.username);
  };

  if (!user || loading || cardSetCount === null || completedQuizCount === null)
    return (
      <Wrapper>
        <InfoSection>
          <ProfileSection>
            <TitleBar>
              <ProfileIcon />
              <Title>用戶總覽</Title>
            </TitleBar>
            <Split />
            <ProfileInfoWrapper>
              <SkeletonAvatar />
              <AccountInfo>
                <SkeletonAccountItem />
                <SkeletonAccountItem />
                <SkeletonAccountItem />
                <SkeletonAccountItem />
              </AccountInfo>
            </ProfileInfoWrapper>
          </ProfileSection>
          <CalendarSection>
            <TitleBar>
              <CalendarIcon />
              <Title>活躍足跡</Title>
            </TitleBar>
            <Split />
            <SkeletonCalendar />
          </CalendarSection>
        </InfoSection>
        <CollectionSection>
          <TitleBar>
            <StarIcon />
            <Title>收藏的卡牌組</Title>
          </TitleBar>
          <Split />
          <Collection />
        </CollectionSection>
      </Wrapper>
    );
  return (
    <Wrapper>
      {contextHolder}
      <InfoSection>
        <ProfileSection>
          <TitleBar>
            <ProfileIcon />
            <Title>用戶總覽</Title>
          </TitleBar>
          <Split />
          <ProfileInfoWrapper>
            <ProfilePictureContainer>
              <ProfilePicture
                src={
                  newProfilePicture
                    ? URL.createObjectURL(newProfilePicture)
                    : user.profilePicture
                }
              />
              <EditProfilePictureIcon onClick={handleIconClick}>
                <EditIcon />
              </EditProfilePictureIcon>
            </ProfilePictureContainer>
            <AccountInfo>
              <AccountInfoTag>Email</AccountInfoTag>
              <AccountInfoItem>{user.email}</AccountInfoItem>
              <EditNameWrapper>
                <AccountInfoTag>用戶名</AccountInfoTag>
                <EditNameIconContainer onClick={handleEditClick}>
                  <EditNameIcon />
                </EditNameIconContainer>
              </EditNameWrapper>
              {isEditingName ? (
                <>
                  <Input
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                  />
                  <EditNameButtonGroup>
                    <EditNameSaveButton onClick={handleSaveUsername}>
                      儲存
                    </EditNameSaveButton>
                    <EditNameCancelButton onClick={handleCancelEdit}>
                      取消
                    </EditNameCancelButton>
                  </EditNameButtonGroup>
                </>
              ) : (
                <>
                  <AccountInfoItem>{user.username}</AccountInfoItem>
                </>
              )}
              <AccountInfoTag>卡牌組數量</AccountInfoTag>
              <AccountInfoItem>
                {cardSetCount ? cardSetCount : 0} 組
              </AccountInfoItem>
              <AccountInfoTag>完成測驗數量</AccountInfoTag>
              <AccountInfoItem>
                {completedQuizCount ? completedQuizCount : 0} 次
              </AccountInfoItem>
            </AccountInfo>
          </ProfileInfoWrapper>
        </ProfileSection>
        {isModalOpen && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>更換頭像</ModalHeader>
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {newProfilePicture && (
                <ImagePreview
                  src={URL.createObjectURL(newProfilePicture)}
                  alt="New profile preview"
                />
              )}
              <ModalActions>
                <UploadButton onClick={handleSaveProfilePicture}>
                  上傳
                </UploadButton>
                <CancelButton onClick={handleCancel}>取消</CancelButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
        <CalendarSection>
          <TitleBar>
            <CalendarIcon />
            <Title>活躍足跡</Title>
          </TitleBar>
          <Split />
          {activeDays.length > 0 && <UserCalendar activeDays={activeDays} />}
        </CalendarSection>
      </InfoSection>
      <CollectionSection>
        <TitleBar>
          <StarIcon />
          <Title>收藏的卡牌組</Title>
        </TitleBar>
        <Split />
        <Collection />
      </CollectionSection>
    </Wrapper>
  );
}

export default UserProfile;

const Wrapper = styled.div`
  padding: 80px 80px 40px 80px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #fff;
  @media only screen and (max-width: 1023px) {
    padding: 80px 100px;
  }
  @media only screen and (max-width: 969px) {
    margin-left: 40px;
  }
  @media only screen and (max-width: 639px) {
    margin-left: 0px;
    padding: 80px 32px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
  @media only screen and (max-width: 969px) {
    flex-direction: column;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #3d5a80;
`;

const Split = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-top: 1.5px solid #c9c9c9;
  width: 100%;
`;

const ProfileSection = styled.div`
  display: flex;
  justify-content: center;
  width: 50%;
  margin-bottom: 36px;
  flex-direction: column;
  height: 100%;
  @media only screen and (max-width: 969px) {
    width: 100%;
  }
  @media only screen and (max-width: 480px) {
    gap: 20px;
    align-items: center;
  }
`;

const ProfileInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 16%;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
`;

const ProfilePictureContainer = styled.div`
  height: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;
const ProfilePicture = styled.img`
  height: 160px;
  width: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3;
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 40px;
  justify-content: space-around;
  @media only screen and (max-width: 1023px) {
    padding-left: 0px;
  }
  @media only screen and (max-width: 480px) {
    gap: 14px;
    padding-left: 0;
    align-items: center;
  }
`;

const EditNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 180px;
  @media only screen and (max-width: 480px) {
    width: fit-content;
  }
`;

const EditNameIconContainer = styled.div`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const EditNameButtonGroup = styled.div`
  margin: 8px 0 8px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
`;

const EditNameSaveButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
  height: 32px;
  background-color: #3d5a80;
  border-radius: 4px;
  font-size: 14px;
  font-family: "Noto Sans TC", sans-serif;
  color: #fff;
  cursor: pointer;
`;

const EditNameCancelButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
  height: 32px;
  background-color: #c9c5c5;
  border-radius: 4px;
  font-size: 14px;
  font-family: "Noto Sans TC", sans-serif;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const AccountInfoTag = styled.p`
  margin-bottom: 10px;
  font-size: 12px;
  color: rgb(125, 125, 125);
  font-family: "Noto Sans TC", sans-serif;
  user-select: none;
`;

const AccountInfoItem = styled.p`
  font-size: 16px;
  margin-bottom: 10px;
  color: rgb(37, 37, 37);
  user-select: none;
`;

const CalendarSection = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 50%;
  @media only screen and (max-width: 969px) {
    width: 100%;
  }
`;

const EditProfilePictureIcon = styled.div`
  position: absolute;
  bottom: 5%;
  right: 5%;
  background-color: white;
  padding: 6px;
  border-radius: 50%;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 130;
`;

const ModalContent = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
  min-width: 300px;
  max-width: 400px;
  min-height: 240px;
`;

const ModalHeader = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
`;

const FileInput = styled.input`
  margin-bottom: 20px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  border-radius: 8px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`;

const UploadButton = styled.button`
  padding: 10px 20px;
  background-color: #3d5a80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  font-size: 14px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #c9c5c5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  font-family: "Noto Sans TC", sans-serif;
  font-size: 14px;
`;

const UserCalendar = ({ activeDays }) => {
  const [value, setValue] = useState(new Date());
  const [activeView, setActiveView] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);

  useEffect(() => {
    if (activeDays) {
      const days = activeDays.map((day) => new Date(day.seconds * 1000));
      setHighlightedDates(days);
    }
  }, [activeDays]);

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      setActiveView(activeStartDate);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isInFuture = date > new Date();

      const isActive = highlightedDates.some(
        (activeDay) =>
          activeDay.getDate() === date.getDate() &&
          activeDay.getMonth() === date.getMonth() &&
          activeDay.getFullYear() === date.getFullYear()
      );

      const belongsToDisplayedMonth =
        date.getMonth() === activeView.getMonth() &&
        date.getFullYear() === activeView.getFullYear();

      if (belongsToDisplayedMonth) {
        if (isInFuture) {
          return "future-date";
        }
        return isActive ? "highlight" : "inactive";
      }

      return "other-month";
    }
    return null;
  };

  return (
    <CalendarWrapper>
      <Calendar
        value={value}
        tileClassName={tileClassName}
        view="month"
        maxDetail="month"
        showNavigation={true}
        onActiveStartDateChange={handleActiveStartDateChange}
        activeStartDate={activeView}
      />
      <ExplanationWrapper>
        <ExplanationBar>
          <ExampleActiveCircle />
          <ExampleText>上線日期</ExampleText>
        </ExplanationBar>
        <ExplanationBar>
          <ExampleTodayCircle />
          <ExampleText>今日日期</ExampleText>
        </ExplanationBar>
      </ExplanationWrapper>
    </CalendarWrapper>
  );
};

const CalendarWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: row;
  @media only screen and (max-width: 1279px) {
    flex-direction: column;
  }
  @media only screen and (max-width: 969px) {
    flex-direction: row;
    margin-bottom: 16px;
  }
  @media only screen and (max-width: 750px) {
    flex-direction: column;
  }
  .react-calendar {
    font-family: "Noto Sans TC", sans-serif;
    width: 360px;
    height: 360px;
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 20px;
    border: none;
    display: flex;
    flex-direction: column;
    @media only screen and (max-width: 480px) {
      width: 100%;
      height: 360px;
    }
  }

  .react-calendar__viewContainer,
  .react-calendar__month-view {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .react-calendar__navigation button {
    color: #6f8695;
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
    font-weight: bold;
  }

  .react-calendar__navigation__label {
    font-weight: bold;
    font-size: 18px;
    color: #3d5a80;
    cursor: default !important;
    pointer-events: none;
    user-select: none;
  }

  .react-calendar__navigation__label > button {
    cursor: default !important;
    pointer-events: none;
  }

  .react-calendar__year-view__months__month {
    pointer-events: none !important;
    cursor: default !important;
  }

  .react-calendar__month-view__days {
    flex-grow: 1;
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 2px;
  }

  .react-calendar__tile {
    max-width: 100% !important;
    aspect-ratio: 1;
    background: none;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    font-size: 14px;
    border: 1px solid transparent;
    pointer-events: none;
    font-family: "Noto Sans TC", sans-serif;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    cursor: default;
  }
  .react-calendar__navigation button:hover,
  .react-calendar__navigation button:focus,
  .react-calendar__navigation button:active {
    background-color: transparent;
    outline: none;
  }

  .highlight {
    background-color: #00b4d8;
    color: white !important;
    border-radius: 50%;
  }

  .highlight:hover {
    background-color: #00b4d8;
  }

  .inactive {
    background-color: #e0e0e0 !important;
    color: black !important;
    border-radius: 50%;
  }

  .react-calendar__tile--disabled {
    color: #ccc;
  }

  .react-calendar__navigation {
    cursor: default;
    color: #3d5a80;
    font-family: "Noto Sans TC", sans-serif;
  }

  .react-calendar__navigation button {
    background-color: none;
    padding: 10px;
    border: none;
    cursor: pointer;
    font-family: "Noto Sans TC", sans-serif;
  }
  .react-calendar__navigation button:hover,
  .react-calendar__navigation button:focus,
  .react-calendar__navigation button:active {
    background-color: transparent;
    outline: none;
  }

  .react-calendar__navigation button {
    background: transparent;
  }

  .react-calendar__navigation__label {
    font-weight: bold;
    font-size: 18px;
    color: #6f8695;
    cursor: not-allowed;
  }

  .react-calendar__month-view__weekdays {
    display: none !important;
  }

  .react-calendar__month-view__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .react-calendar__navigation__next2-button {
    display: none;
  }

  .react-calendar__navigation__prev2-button {
    display: none;
  }

  .react-calendar__navigation__label {
  }
  .highlight {
    background-color: #00b4d8;
    color: white !important;
  }

  .highlight:hover {
    background-color: #00b4d8;
  }

  .inactive {
    background-color: #e0e0e0 !important;
    color: black !important;
  }

  .other-month {
    color: #ccc !important;
    background: none !important;
  }

  .future-date {
    background: none !important;
    color: black !important;
  }

  .react-calendar__tile--now {
    background: none !important;
    color: #000 !important;
    position: relative;
  }

  .react-calendar__tile--now::after {
    content: "";
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: #ff8a5b;
    border-radius: 50%;
    z-index: 1;
  }

  .react-calendar__navigation__label__labelText,
  .react-calendar__navigation__label__labelText--from {
    color: #3d5a80;
  }
`;

const CollectionSection = styled.div`
  width: 100%;
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3d5a80;
`;

const ExplanationWrapper = styled.div`
  width: fit-content;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 10px;
  align-self: flex-end;
`;

const ExplanationBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ExampleActiveCircle = styled.div`
  background-color: #00b4d8;
  border-radius: 50%;
  width: 10px;
  height: 10px;
`;

const ExampleTodayCircle = styled.div`
  background-color: #ff8a5b;
  border-radius: 50%;
  width: 10px;
  height: 10px;
`;

const ExampleText = styled.div`
  font-size: 14px;
`;

/* Skeleton */
const skeletonLoading = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonAvatar = styled.div`
  height: 160px;
  width: 160px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonLoading} 1.5s infinite;
`;

const SkeletonAccountItem = styled.div`
  margin-bottom: 10px;
  height: 24px;
  width: 200px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonLoading} 1.5s infinite;
`;

const SkeletonCalendar = styled.div`
  margin: 12px auto 0 auto;
  width: 360px;
  height: 360px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonLoading} 1.5s infinite;

  @media only screen and (max-width: 969px) {
    margin-bottom: 16px;
  }
  @media only screen and (max-width: 480px) {
    width: 100%;
    height: 360px;
  }
`;
