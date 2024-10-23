import { Modal, message } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  CardSetDetailEditIcon as EditIcon,
  UserCardSetsFolderIcon as FolderIcon,
  LabelIcon,
  UserCardSetsMoreIcon as MoreIcon,
  PrivateIcon,
  PublicIcon,
  CardSetDetailShareIcon as ShareIcon,
  CardSetDetailTrashIcon as TrashIcon,
} from "../../assets/icons/index.jsx";
import { useUser } from "../../context/UserContext.jsx";
import {
  deleteCardSet,
  getUserAllCardSets,
  getUserCardStyles,
} from "../../utils/api.js";

function UserCardSets() {
  const { user } = useUser();
  const [currentUserId, setCurrentUserId] = useState("");
  const [userCardSets, setUserCardSets] = useState(null);
  const [userCardStyles, setUserCardStyles] = useState(null);
  const [styleMap, setStyleMap] = useState(null);
  const [visibleMenuCardSetId, setVisibleMenuCardSetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.userId);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCardSets = async () => {
      if (currentUserId) {
        const cardSets = await getUserAllCardSets(currentUserId);
        const sortedCardSets = cardSets.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.toMillis
              ? a.createdAt.toMillis()
              : new Date(a.createdAt).getTime();
            const bTime = b.createdAt.toMillis
              ? b.createdAt.toMillis()
              : new Date(b.createdAt).getTime();
            return aTime - bTime;
          }
          return 0;
        });

        setUserCardSets(sortedCardSets);

        const cardStyles = await getUserCardStyles(currentUserId);
        setUserCardStyles(cardStyles);
        const newStyleMap = cardStyles.reduce((acc, style) => {
          acc[style.styleId] = style;
          return acc;
        }, {});
        setStyleMap(newStyleMap);
      }
    };

    fetchCardSets();
  }, [currentUserId]);

  const toggleMenu = (cardSetId) => {
    setVisibleMenuCardSetId((prev) => (prev === cardSetId ? null : cardSetId));
  };

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

  async function handleDeleteCardSet(cardSetId) {
    if (isDeleting) return;

    Modal.confirm({
      title: "刪除卡牌組後無法復原，確定刪除嗎？",
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
          setIsDeleting(true);
          await deleteCardSet(cardSetId);
          message.success("已刪除卡牌。");
          setUserCardSets((prev) =>
            prev.filter((set) => set.cardSetId !== cardSetId)
          );
        } catch (error) {
          console.error("刪除卡牌組失敗：", error);
          message.error("刪除卡牌失敗，請稍後再試！");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }
  if (!currentUserId || !userCardSets || !userCardStyles || !styleMap) {
    return (
      <Wrapper>
        <TitleBar>
          <FolderIcon />
          <Title>所有卡牌組</Title>
        </TitleBar>
        <Split />
        <CardGridWrapper>
          <SkeletonCardContainer />
          <SkeletonCardContainer />
          <SkeletonCardContainer />
          <SkeletonCardContainer />
        </CardGridWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {contextHolder}
      <TitleBar>
        <FolderIcon />
        <Title>所有卡牌組</Title>
      </TitleBar>
      <Split />
      <CardGridWrapper>
        {userCardSets &&
          userCardStyles &&
          styleMap &&
          userCardSets.length > 0 &&
          userCardSets.map((cardSet) => {
            return (
              <CardContainer key={cardSet.cardSetId}>
                <Link to={`/cardset/${cardSet.cardSetId}`}>
                  <CardWrapper $cardSetStyle={styleMap[cardSet.styleId]}>
                    {cardSet.title}
                  </CardWrapper>
                </Link>
                <CardSetDetailsContainer>
                  <CardSetActionWrapper>
                    <Link to={`/cardset/${cardSet.cardSetId}`}>
                      <CardSetTitle>{cardSet.title}</CardSetTitle>
                    </Link>
                    <EditIconContainer>
                      <Link to={`/cardset/${cardSet.cardSetId}/edit`}>
                        <EditIcon />
                      </Link>
                    </EditIconContainer>
                  </CardSetActionWrapper>
                  <CardSetDescription>{cardSet.description}</CardSetDescription>
                  <LabelWrapper>
                    <CardNumber>{cardSet.cardOrder.length} 張字卡</CardNumber>
                  </LabelWrapper>
                  <LabelWrapper>
                    {cardSet.visibility === "public" ? (
                      <>
                        <LabelIconContainer>
                          <PublicIcon />
                        </LabelIconContainer>
                        <PrivacyName>公開</PrivacyName>
                      </>
                    ) : (
                      <>
                        <LabelIconContainer>
                          <PrivateIcon />
                        </LabelIconContainer>
                        <PrivacyName>私人</PrivacyName>
                      </>
                    )}
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
                            onClick={() =>
                              handleDeleteCardSet(cardSet.cardSetId)
                            }
                          >
                            <TrashIcon />
                            <SubMenuItemText $isDelete>
                              {isDeleting ? "刪除中..." : "刪除"}
                            </SubMenuItemText>
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
      {userCardSets && userCardSets.length === 0 && (
        <div>
          目前沒有卡牌組，可以點擊
          <LinkToCardSetNew to="/cardset/new">此處</LinkToCardSetNew>
          建立卡牌組！
        </div>
      )}
    </Wrapper>
  );
}

export default UserCardSets;

const Wrapper = styled.div`
  padding: 80px 80px;
  min-height: 100vh;
  background-color: #fff;
  @media only screen and (min-width: 640px) and (max-width: 1023px) {
    margin-left: 60px;
  }
  @media only screen and (max-width: 639px) {
    margin-left: 0px;
    padding: 80px 32px;
  }
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3d5a80;
`;

const Title = styled.h2`
  font-size: 22px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  color: #3d5a80;
`;

const Split = styled.div`
  margin-top: 16px;
  border-top: 1px solid #c9c9c9;
  width: 100%;
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

const CardSetActionWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: row;
`;

const CardSetTitle = styled.p`
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

const PrivacyName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
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

const EditIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
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
  min-width: 120px;
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

const LinkToCardSetNew = styled(Link)`
  margin: 0 4px;
  color: #3d5a80;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
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
