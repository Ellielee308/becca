import { Modal, message } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import {
  getCardSet,
  getStyle,
  getUserCollection,
  unfavoriteCardSet,
} from "../../utils/api";

function Collection() {
  const { user } = useUser();
  const [userCollection, setUserCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenuCardSetId, setVisibleMenuCardSetId] = useState(null);

  useEffect(() => {
    const fetchUserCollection = async () => {
      try {
        if (user && user.userId) {
          const collectionIds = await getUserCollection(user.userId);

          const collectionWithDetails = await Promise.all(
            collectionIds.map(async (cardSetId) => {
              const cardSet = await getCardSet(cardSetId);
              if (cardSet && cardSet.styleId) {
                const style = await getStyle(cardSet.styleId);
                return { ...cardSet, style };
              } else {
                return { ...cardSet, style: null };
              }
            })
          );
          setUserCollection(collectionWithDetails);
        }
      } catch (error) {
        console.error("獲取用戶收藏或樣式失敗：", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollection();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest(".more-actions-container") ||
        event.target.closest(".sub-menu")
      ) {
        return;
      }
      setVisibleMenuCardSetId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (cardSetId) => {
    setVisibleMenuCardSetId((prev) => (prev === cardSetId ? null : cardSetId));
  };

  function copyShareUrl(cardSetId) {
    const copyText = `https://becca-24.web.app/cardset/${cardSetId}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(copyText)
        .then(() => {
          message.success("已複製分享連結！");
        })
        .catch((error) => {
          console.error("無法複製分享連結：", error);
          message.error("複製失敗，請重試");
        });
    } else {
      console.error("無法複製分享連結：沒有clipboard API");
      message.error("瀏覽器不支援複製功能！");
    }
  }

  const handleUnfavorite = async (cardSetId) => {
    Modal.confirm({
      title: "確定要取消收藏該卡牌組嗎？",
      okText: "確定",
      cancelText: "取消",
      icon: null,
      centered: true,
      okButtonProps: {
        style: {
          backgroundColor: "#3d5a80",
          color: "white",
          outline: "none",
          border: "none",
          boxShadow: "none",
        },
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#c9c5c5",
          color: "white",
          outline: "none",
          border: "none",
          boxShadow: "none",
        },
      },
      onOk: async () => {
        try {
          await unfavoriteCardSet(user.userId, cardSetId);
          message.success("已取消收藏");
          setUserCollection((prev) =>
            prev.filter((set) => set.cardSetId !== cardSetId)
          );
        } catch (error) {
          console.error("取消收藏失敗：", error);
          message.error("操作失敗，請稍後再試");
        }
      },
    });
  };

  if (loading)
    return (
      <Wrapper>
        <CardGridWrapper>
          <SkeletonCardContainer />
          <SkeletonCardContainer />
          <SkeletonCardContainer />
        </CardGridWrapper>
      </Wrapper>
    );
  return (
    <Wrapper>
      <CardGridWrapper>
        {userCollection &&
          userCollection.length > 0 &&
          userCollection.map((cardSet) => {
            return (
              <CardContainer key={cardSet.cardSetId}>
                <Link to={`/cardset/${cardSet.cardSetId}`}>
                  <CardWrapper $cardSetStyle={cardSet.style}>
                    {cardSet.title}
                  </CardWrapper>
                </Link>
                <CardSetDetailsContainer>
                  <Link to={`/cardset/${cardSet.cardSetId}`}>
                    <CardSetTitle>{cardSet.title}</CardSetTitle>
                  </Link>
                  <CardSetDescription>{cardSet.description}</CardSetDescription>
                  <LabelWrapper>
                    <CardNumber>{cardSet.cardOrder.length} 張字卡</CardNumber>
                  </LabelWrapper>
                  <LabelWrapper>
                    <LabelIconContainer>
                      <LabelIcon />
                    </LabelIconContainer>
                    <LabelNameContainer>
                      {cardSet.labels.length > 0 ? (
                        cardSet.labels.map((label, index) => (
                          <Link
                            key={label.labelId}
                            to={`/search/${label.name}`}
                          >
                            <LabelName>
                              {label.name}
                              {index < cardSet.labels.length - 1 && ", "}
                            </LabelName>
                          </Link>
                        ))
                      ) : (
                        <NoLabelName>無標籤</NoLabelName>
                      )}
                    </LabelNameContainer>
                    <MoreActionsContainer
                      className="more-actions-container"
                      onClick={() => toggleMenu(cardSet.cardSetId)}
                    >
                      <MoreIcon />
                      {visibleMenuCardSetId === cardSet.cardSetId && (
                        <SubMenu className="sub-menu">
                          <SubMenuItem
                            onClick={() => copyShareUrl(cardSet.cardSetId)}
                          >
                            <ShareIcon />
                            <SubMenuItemText>分享</SubMenuItemText>
                          </SubMenuItem>
                          <SubMenuItem
                            onClick={() => handleUnfavorite(cardSet.cardSetId)}
                          >
                            <StarIcon />
                            <SubMenuItemText>取消收藏</SubMenuItemText>
                          </SubMenuItem>
                        </SubMenu>
                      )}
                    </MoreActionsContainer>
                  </LabelWrapper>
                </CardSetDetailsContainer>
              </CardContainer>
            );
          })}
      </CardGridWrapper>
      {userCollection && userCollection.length === 0 && (
        <div>目前沒有收藏的卡牌組，可以透過上方的搜尋框找到更多卡牌組哦！</div>
      )}
    </Wrapper>
  );
}

export default Collection;

const Wrapper = styled.div`
  padding-bottom: 20px;
  @media only screen and (max-width: 639px) {
    padding: 0;
  }
`;

const CardGridWrapper = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const CardContainer = styled.div`
  width: 100%;
  padding: 20px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  background-color: #fff;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  max-height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.$cardSetStyle.borderRadius};
  border: ${(props) => props.$cardSetStyle.borderStyle};
  border-width: ${(props) => props.$cardSetStyle.$borderWidth};
  border-color: ${(props) => props.$cardSetStyle.borderColor};
  background-color: ${(props) => props.$cardSetStyle.backgroundColor};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media only screen and (max-width: 1024px) {
    max-height: 320px;
  }
`;
const CardSetDetailsContainer = styled.div`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
`;

const CardSetTitle = styled.p`
  margin-top: 8px;
  font-size: 16px;
`;

const CardSetDescription = styled.p`
  margin-top: 8px;
  font-size: 14px;
  text-align: justify;
  height: 60px;
  overflow: hidden;
  white-space: pre-line;
  color: gray;
  line-height: 24px;
`;

const LabelWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;
const CardNumber = styled.div`
  padding: 6px 16px;
  font-family: "Noto Sans TC", sans-serif;
  background-color: #d0d7e3;
  color: #3d5a80;
  border-radius: 100vw;
  font-size: 14px;
  transition: background-color 0.5s ease;
  user-select: none;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
`;

const LabelNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #3d5a80;
  }
`;
const NoLabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const MoreActionsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: auto;
`;

const SubMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  min-width: 140px;
  z-index: 100;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
`;

const SubMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const SubMenuItemText = styled.p`
  margin-left: 14px;
  color: ${(props) => (props.$isDelete ? "red" : "inherit")};
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

const SkeletonCardContainer = styled.div`
  width: 100%;
  aspect-ratio: 23/24;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonLoading} 1.5s infinite;
`;

const LabelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
    />
  </svg>
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="22"
    height="22"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="rgb(255, 205, 31)"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="rgb(255, 205, 31)"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);
