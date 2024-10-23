import { ConfigProvider, message, Modal, Result, Tooltip } from "antd";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import {
  ArrowDown,
  ArrowUp,
  CardSetDetailEditIcon,
  CardSetDetailMoreIcon,
  CardSetDetailShareIcon,
  CardSetDetailTrashIcon,
  FilledStarIcon,
  LabelIcon,
  LeftArrowIcon,
  ListIcon,
  MultiplePlayersIcon,
  PuzzleIcon,
  RightArrowIcon,
  ShuffleIcon,
  StarIcon,
} from "../../assets/icons";
import { useUser } from "../../context/UserContext.jsx";
import {
  deleteCardSet,
  favoriteCardSet,
  getCardSet,
  getCardsOfCardSet,
  getStyle,
  getTemplate,
  getUserDocument,
  isCardSetFavorited,
  unfavoriteCardSet,
} from "../../utils/api";
import CreateGameModal from "./CreateGameModal";
import CreateQuizModal from "./CreateQuizModal";

function CardSetDetail() {
  const { cardSetId } = useParams();
  const [cardSetData, setCardSetData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [style, setStyle] = useState(null);
  const [cards, setCards] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [cardsShuffled, setCardsShuffled] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [ownerData, setOwnerData] = useState();
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(null);
  const [showCreateGameModal, setShowCreateGameModal] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCardListDisplayed, setIsCardListDisplayed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useUser();
  useEffect(() => {
    const fetchCardSetData = async () => {
      try {
        const fetchedCardSetData = await getCardSet(cardSetId);
        if (!fetchedCardSetData) throw new Error("Card set not found");

        setCardSetData(fetchedCardSetData);

        const cardStyle = await getStyle(fetchedCardSetData.styleId);
        setStyle(cardStyle);

        const cardTemplate = await getTemplate(
          fetchedCardSetData.fieldTemplateId
        );
        setTemplate(cardTemplate);

        const unorderedCards = await getCardsOfCardSet(cardSetId);
        const orderedCards = fetchedCardSetData.cardOrder
          .map((cardId) =>
            unorderedCards.find((card) => card.cardId === cardId)
          )
          .filter(Boolean);

        setCards(orderedCards);

        if (fetchedCardSetData.userId) {
          const ownerData = await getUserDocument(fetchedCardSetData.userId);
          setOwnerData(ownerData);
        }
      } catch (error) {
        console.error("獲取卡牌組資料或標籤失敗：", error);
      }
    };

    fetchCardSetData();
  }, [cardSetId]);

  useEffect(() => {
    const checkIfFavorited = async () => {
      const favorited = await isCardSetFavorited(user.userId, cardSetId);
      setIsFavorited(favorited);
    };
    if (user) {
      checkIfFavorited();
    } else {
      setIsFavorited(false);
    }
  }, [user, cardSetId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest(".more-actions-container") ||
        event.target.closest(".sub-menu")
      ) {
        return;
      }
      setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex
    );
  }, [cards.length]);
  const handlePreviousCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleShuffleCards = () => {
    if (!cardsShuffled) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }
    setCardsShuffled((prev) => !prev);
    setCurrentCardIndex(0);
  };

  const handleSwitchCardWithKeyboard = useCallback(
    (event) => {
      const tagName = event.target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          handlePreviousCard();
          break;
        case "ArrowRight":
          handleNextCard();
          break;
        default:
          return;
      }
    },
    [handleNextCard, handlePreviousCard]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleSwitchCardWithKeyboard);

    return () => {
      window.removeEventListener("keydown", handleSwitchCardWithKeyboard);
    };
  }, [handleSwitchCardWithKeyboard]);

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

  const handleNavigateToEdit = () => {
    navigate(`/cardset/${cardSetId}/edit`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      message.warning("會員才能使用收藏功能，請登入！");
      return;
    }
    try {
      if (isFavorited) {
        await unfavoriteCardSet(user.userId, cardSetId);
        setIsFavorited(false);
        message.success("已取消收藏");
      } else {
        await favoriteCardSet(user.userId, cardSetId);
        setIsFavorited(true);
        message.success("已加入收藏");
      }
    } catch (error) {
      console.error("切換收藏狀態失敗：", error);
      message.error("操作失敗，請稍後再試");
    }
  };

  const toggleCardListDisplay = () => {
    setIsCardListDisplayed((prev) => !prev);
  };

  const customTheme = {
    components: {
      Result: {
        titleFontSize: 20,
      },
    },
    token: {
      colorPrimary: "#3d5a80",
      colorTextHeading: "#3d5a80",
      borderRadius: 8,
      fontFamily: "'TaiwanPearl-Regular', 'Noto Sans TC', sans-serif;",
    },
  };

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
          navigate("/user/me/cardsets");
        } catch (error) {
          console.error("刪除卡牌組失敗：", error);
          message.error("刪除卡牌失敗，請稍後再試！");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }

  if (!cardSetData || !cards || !ownerData || loading) {
    return (
      <Background>
        <SkeletonWrapper>
          <SkeletonTitle />
          <SkeletonCard />
          <SkeletonProgressBar />
          <SkeletonDescriptionBox>
            <SkeletonAvatar />
            <SkeletonDescriptionWrapper>
              <SkeletonAuthorName />
              <SkeletonDescription />
            </SkeletonDescriptionWrapper>
          </SkeletonDescriptionBox>
        </SkeletonWrapper>
      </Background>
    );
  }
  return (
    <Background>
      {contextHolder}
      {cardSetData.visibility === "private" &&
      (!user || user.userId !== ownerData.userId) ? (
        <NoAccessWrapper>
          <ConfigProvider theme={customTheme}>
            <Result
              status="warning"
              title="此卡牌組為私人卡牌組，您沒有權限查看。"
            />
          </ConfigProvider>
          <NoAccessNavWrapper>
            <HomepageButton to="/">回到首頁</HomepageButton>
            {user && user.userId && (
              <CardSetButton to="user/me/profile">我的卡牌組</CardSetButton>
            )}
          </NoAccessNavWrapper>
        </NoAccessWrapper>
      ) : (
        <>
          <Wrapper>
            {showCreateQuizModal && (
              <CreateQuizModal
                onClose={() => setShowCreateQuizModal(null)}
                quizType={showCreateQuizModal}
                cardSetId={cardSetId}
                totalCardsNumber={cards.length}
                cards={cards}
              />
            )}
            {showCreateGameModal && (
              <CreateGameModal
                onClose={() => setShowCreateGameModal(null)}
                quizType={showCreateGameModal}
                cardSetId={cardSetId}
                totalCardsNumber={cards.length}
                cards={cards}
              />
            )}
            <TitleBar>
              <Title>{cardSetData.title}</Title>
              <StarContainer onClick={handleToggleFavorite}>
                {isFavorited ? <FilledStarIcon /> : <StarIcon />}
              </StarContainer>
            </TitleBar>
            <CardContainer>
              <ArrowIconContainer
                disabled={currentCardIndex === 0}
                onClick={handlePreviousCard}
              >
                <LeftArrowIcon />
              </ArrowIconContainer>
              {cardSetId && style && template && cards && (
                <CardContent
                  currentStyle={style}
                  currentTemplate={template}
                  currentCard={
                    cardsShuffled
                      ? shuffledCards[currentCardIndex]
                      : cards[currentCardIndex]
                  }
                />
              )}
              <ArrowIconContainer
                disabled={currentCardIndex === cards.length - 1}
                onClick={handleNextCard}
              >
                <RightArrowIcon />
              </ArrowIconContainer>
            </CardContainer>
            <CardSetDetailsWrapper>
              <MobileActionBar>
                <MobileArrowIconContainer
                  disabled={currentCardIndex === 0}
                  onClick={handlePreviousCard}
                >
                  <LeftArrowIcon />
                </MobileArrowIconContainer>
                <CardNumberWrapper>{`${currentCardIndex + 1} / ${
                  cards.length
                }`}</CardNumberWrapper>
                <MobileArrowIconContainer
                  disabled={currentCardIndex === cards.length - 1}
                  onClick={handleNextCard}
                >
                  <RightArrowIcon />
                </MobileArrowIconContainer>
              </MobileActionBar>
              <ProgressBar>
                <Progress
                  width={`${((currentCardIndex + 1) / cards.length) * 100}%`}
                />
              </ProgressBar>
              <ActionWrapper>
                <LabelWrapper>
                  <LabelIconContainer>
                    <LabelIcon />
                  </LabelIconContainer>
                  <LabelNameContainer>
                    {cardSetData.labels.length > 0 ? (
                      cardSetData.labels.map((label, index) => (
                        <Link key={index} to={`/search/${label.name}`}>
                          <LabelName>
                            {label.name}
                            {index < cardSetData.labels.length - 1 && ", "}
                          </LabelName>
                        </Link>
                      ))
                    ) : (
                      <NoLabelName>無標籤</NoLabelName>
                    )}
                  </LabelNameContainer>
                </LabelWrapper>
                <MoreActionsContainer>
                  <Tooltip title="隨機排序卡牌" arrow={false}>
                    <ShuffleTrigger
                      $isActive={cardsShuffled}
                      onClick={toggleShuffleCards}
                    >
                      <ShuffleIcon />
                    </ShuffleTrigger>
                  </Tooltip>
                  <Tooltip title="更多" arrow={false}>
                    <MoreTrigger
                      className="more-actions-container"
                      onClick={toggleMenu}
                    >
                      <CardSetDetailMoreIcon />
                      {isMenuOpen && (
                        <SubMenu className="sub-menu">
                          <SubMenuItem onClick={() => copyShareUrl(cardSetId)}>
                            <CardSetDetailShareIcon />
                            <SubMenuItemText>分享</SubMenuItemText>
                          </SubMenuItem>
                          {user.userId === ownerData.userId && (
                            <>
                              <SubMenuItem onClick={handleNavigateToEdit}>
                                <CardSetDetailEditIcon />
                                <SubMenuItemText>編輯</SubMenuItemText>
                              </SubMenuItem>
                              <SubMenuItem
                                onClick={() => handleDeleteCardSet(cardSetId)}
                              >
                                <CardSetDetailTrashIcon />
                                <SubMenuItemText $isDelete>
                                  刪除
                                </SubMenuItemText>
                              </SubMenuItem>
                            </>
                          )}
                        </SubMenu>
                      )}
                    </MoreTrigger>
                  </Tooltip>
                </MoreActionsContainer>
              </ActionWrapper>
              <InformationWrapper>
                <ProfilePictureWrapper>
                  {cardSetData && ownerData && ownerData.profilePicture && (
                    <ProfilePicture src={ownerData.profilePicture} />
                  )}
                </ProfilePictureWrapper>
                <DescriptionWrapper>
                  <AuthorName>{`作者： ${ownerData.username}`}</AuthorName>
                  <Description>{cardSetData.description}</Description>
                </DescriptionWrapper>
              </InformationWrapper>
              <hr />
              <EvaluationSection>
                <SectionTitleWrapper>
                  <PuzzleIcon />
                  <SectionTitle>測驗</SectionTitle>
                </SectionTitleWrapper>
                <GameOptionsWrapper>
                  <GameOptionButton
                    onClick={() => {
                      if (!user) {
                        message.warning("會員才能創建測驗，請先登入！");
                        return;
                      }
                      if (cards.length < 4) {
                        message.warning("至少要有四張字卡才能進行配對測驗！");
                        return;
                      }
                      setShowCreateQuizModal("matching");
                    }}
                  >
                    配對題
                  </GameOptionButton>
                  <GameOptionButton
                    onClick={() => {
                      if (!user) {
                        message.warning("會員才能創建測驗，請先登入！");
                        return;
                      }
                      if (cards.length < 4) {
                        message.warning("至少要有四張字卡才能進行選擇題測驗！");
                        return;
                      }
                      setShowCreateQuizModal("multipleChoices");
                    }}
                  >
                    選擇題
                  </GameOptionButton>
                </GameOptionsWrapper>
                <SectionTitleWrapper>
                  <MultiplePlayersIcon />
                  <SectionTitle>多人遊戲</SectionTitle>
                </SectionTitleWrapper>
                <GameOptionsWrapper>
                  <GameOptionButton
                    $isGame
                    onClick={() => {
                      if (!user) {
                        message.warning("會員才能創建遊戲，請先登入！");
                        return;
                      }
                      if (cards.length < 4) {
                        message.warning("至少要有四張字卡才能進行配對遊戲！");
                        return;
                      }
                      setShowCreateGameModal("matching");
                    }}
                  >
                    配對題
                  </GameOptionButton>
                  <GameOptionButton
                    $isGame
                    onClick={() => {
                      if (!user) {
                        message.warning("會員才能創建遊戲，請先登入！");
                        return;
                      }
                      if (cards.length < 4) {
                        message.warning("至少要有四張字卡才能進行選擇題遊戲！");
                        return;
                      }
                      setShowCreateGameModal("multipleChoices");
                    }}
                  >
                    選擇題
                  </GameOptionButton>
                </GameOptionsWrapper>
                <hr />
              </EvaluationSection>
              <SectionTitleWrapper>
                <ListIcon />
                <SectionTitle>{`所有字卡  (${cards.length})`}</SectionTitle>
                <Tooltip title="展開字卡" arrow={false}>
                  <SpreadArrowContainer onClick={toggleCardListDisplay}>
                    {isCardListDisplayed ? <ArrowUp /> : <ArrowDown />}
                  </SpreadArrowContainer>
                </Tooltip>
              </SectionTitleWrapper>
              {isCardListDisplayed && (
                <ListSection>
                  {cards.map((card, index) => (
                    <CardWrapper key={card.cardId}>
                      <SerialNumber>{index + 1}</SerialNumber>
                      <CardContentWrapper>
                        <Side>
                          <SideHeading>正面</SideHeading>
                          {template.frontFields.map((frontField, index) => {
                            if (frontField.type === "text") {
                              return (
                                <TextWrapper key={index}>
                                  {card.frontFields[index].value}
                                </TextWrapper>
                              );
                            } else if (frontField.type === "image") {
                              if (
                                card.frontFields[index]?.value &&
                                card.frontFields[index].value.trim() !== ""
                              ) {
                                return (
                                  <ImagePreview
                                    key={index}
                                    src={card.frontFields[index].value}
                                    alt={frontField.name}
                                  />
                                );
                              }
                            }
                          })}
                        </Side>
                        <SideSplit />
                        <Side>
                          <SideHeading>背面</SideHeading>
                          {template.backFields.map((backField, index) => {
                            if (backField.type === "text") {
                              return (
                                <TextWrapper key={index}>
                                  {card.backFields[index].value}
                                </TextWrapper>
                              );
                            } else if (backField.type === "image") {
                              if (
                                card.backFields[index]?.value &&
                                card.backFields[index].value.trim() !== ""
                              ) {
                                return (
                                  <ImagePreview
                                    key={index}
                                    src={card.backFields[index].value}
                                    alt={backField.name}
                                  />
                                );
                              }
                            }
                          })}
                        </Side>
                      </CardContentWrapper>
                    </CardWrapper>
                  ))}
                </ListSection>
              )}
            </CardSetDetailsWrapper>
          </Wrapper>
          <SideMenu>
            <SideMenuTitle>練習一下吧！</SideMenuTitle>
            <SideMenuSectionTitle>
              <PuzzleIcon />
              <p>測驗</p>
            </SideMenuSectionTitle>
            <SideMenuQuiz
              onClick={() => {
                if (!user) {
                  message.warning("會員才能創建測驗，請先登入！");
                  return;
                }
                if (cards.length < 4) {
                  message.warning("至少要有四張字卡才能進行配對測驗！");
                  return;
                }
                setShowCreateQuizModal("matching");
              }}
            >
              配對測驗
            </SideMenuQuiz>
            <SideMenuQuiz
              onClick={() => {
                if (!user) {
                  message.warning("會員才能創建測驗，請先登入！");
                  return;
                }
                if (cards.length < 4) {
                  message.warning("至少要有四張字卡才能進行選擇題測驗！");
                  return;
                }
                setShowCreateQuizModal("multipleChoices");
              }}
            >
              選擇題測驗
            </SideMenuQuiz>
            <SideMenuSectionTitle>
              <MultiplePlayersIcon />
              <p>多人遊戲</p>
            </SideMenuSectionTitle>
            <SideMenuGame
              onClick={() => {
                if (!user) {
                  message.warning("會員才能創建遊戲，請先登入！");
                  return;
                }
                if (cards.length < 4) {
                  message.warning("至少要有四張字卡才能進行配對遊戲！");
                  return;
                }
                setShowCreateGameModal("matching");
              }}
            >
              配對遊戲
            </SideMenuGame>
            <SideMenuGame
              onClick={() => {
                if (!user) {
                  message.warning("會員才能創建遊戲，請先登入！");
                  return;
                }
                if (cards.length < 4) {
                  message.warning("至少要有四張字卡才能進行選擇題遊戲！");
                  return;
                }
                setShowCreateGameModal("multipleChoices");
              }}
            >
              選擇題遊戲
            </SideMenuGame>
          </SideMenu>
        </>
      )}
    </Background>
  );
}

export default CardSetDetail;

const Background = styled.div`
  position: relative;
  background-color: #e0ecf8;
  width: 100%;
  height: fit-content;
  padding: 60px 14px;
  @media only screen and (min-width: 640px) {
    display: flex;
    justify-content: center;
  }
`;

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 20px 20px;
  max-width: 1160px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 640px) {
    width: 1160px;
    padding: 0px 20px;
    margin: 0;
  }
`;

const TitleBar = styled.div`
  margin: 32px auto;
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media only screen and (max-width: 639px) {
    width: 100%;
    margin: 0px auto;
  }
`;

const Title = styled.div`
  font-size: 32px;
  user-select: none;
  font-family: "Noto Sans TC", sans-serif;
  color: "#3d5a80";
  font-weight: 450;
  @media only screen and (max-width: 639px) {
    font-size: 28px;
  }
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(255, 205, 31);
  &:hover {
    cursor: pointer;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const ArrowIconContainer = styled.div`
  flex-basis: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.disabled ? "#aaa" : "#fff")};
  background: ${(props) => (props.disabled ? "#d8d6d6" : "#3d5a80")};
  border-radius: 50%;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s;

  &:hover {
    background: ${(props) => (props.disabled ? "#d8d6d6" : "#293a50")};
  }

  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const MobileArrowIconContainer = styled.div`
  flex-basis: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.disabled ? "#d8d6d6" : "black")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const MobileActionBar = styled.div`
  display: flex;
  align-items: center;
`;

const CardSetDetailsWrapper = styled.div`
  width: 100%;
  margin: 20px auto;
  @media only screen and (min-width: 640px) {
    width: 60%;
  }
`;

const CardNumberWrapper = styled.div`
  width: fit-content;
  font-size: 18px;
  margin: 0 auto;
  color: gray;
  user-select: none;
`;

const ProgressBar = styled.div`
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 20px auto;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.width};
  background-color: #76c7c0;
  border-radius: 5px;
  transition: width 0.3s ease;
`;

const ActionWrapper = styled.div`
  display: flex;
  margin: 20px auto;
  justify-content: space-between;
  width: 100%;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 40px;
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
  font-size: 16px;
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
  gap: 8px;
`;

const ShuffleTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$isActive ? "#3d5a80" : "rgba(255, 255, 255, 0.6)"};
  color: ${(props) => (props.$isActive ? "#fff" : "#000")};
  box-shadow: ${(props) =>
    props.$isActive ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none"};
  cursor: pointer;
  transition: background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease,
    color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? "#2c4966" : "rgba(255, 255, 255, 1)"};
  }
`;

const MoreTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
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

const InformationWrapper = styled.div`
  margin: 20px auto;
  padding: 14px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #d3d3d3;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: #333333;
`;

const AuthorName = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
`;

const Description = styled.div`
  font-size: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  white-space: pre-wrap;
  line-height: 24px;
`;

const ProfilePictureWrapper = styled.div`
  margin-right: 20px;
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePicture = styled.img`
  height: 64px;
  width: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3;
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 20px auto;
`;
const SectionTitle = styled.h3`
  margin-left: 16px;
`;

const GameOptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 20px auto;
  @media only screen and (max-width: 934px) {
    gap: 12px;
  }
`;

const GameOptionButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
  height: 80px;
  background-color: ${(props) => (props.$isGame ? "#e2b657" : "#5a9bd4")};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.$isGame ? "#caa34f" : "#4f88bb")};
  }

  &:active {
    transform: scale(0.98);
  }
  @media only screen and (max-width: 934px) {
    flex: 1;
  }
`;

const EvaluationSection = styled.div`
  @media only screen and (min-width: 1024px) {
    display: none;
  }
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const SpreadArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  margin-left: 8px;
  cursor: pointer;
`;

const CardWrapper = styled.div`
  padding: 20px 30px;
  width: 100%;
  min-height: 180px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const SerialNumber = styled.p`
  font-size: 18px;
  margin-bottom: 8px;
`;

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: row;

  @media only screen and (max-width: 639px) {
    flex-direction: column;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 120px;
  border-left: 1px solid #c9c5c5;
  align-self: center;
  margin: 0px 30px;
  @media only screen and (max-width: 639px) {
    height: 0px;
    width: 20%;
    border-left: none;
    margin: 20px 0px;
  }
`;

const SideHeading = styled.p`
  font-size: 16px;
  margin-bottom: 12px;
  color: #696767;
`;

const TextWrapper = styled.div`
  font-size: 16px;
  line-height: 30px;
  border-bottom: 1px solid #c0c5c5;
`;

const ImagePreview = styled.img`
  height: 80px;
  width: auto;
  margin: 0 auto;
`;

const SideMenu = styled.div`
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  width: 20%;
  padding: 24px;
  height: fit-content;
  background-color: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  @media only screen and (max-width: 1023px) {
    display: none;
  }
  @media only screen and (min-width: 1440px) {
    width: 278px;
  }
`;

const SideMenuTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
`;

const SideMenuSectionTitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 16px;
  color: #34495e;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SideMenuQuiz = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 56px;
  padding: 14px 18px;
  margin: 0 auto 16px auto;
  border-radius: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  background-color: #3498db;
  transition: all 0.3s;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #2980b9;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SideMenuGame = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 56px;
  padding: 14px 18px;
  margin: 0 auto 16px auto;
  border-radius: 10px;
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  background-color: #f39c12;
  transition: all 0.3s;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #e67e22;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const NoAccessWrapper = styled.div`
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NoAccessNavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
`;

const HomepageButton = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px;
  padding: 0 16px;
  border-radius: 8px;
  background-color: #3d5a80;
  cursor: pointer;
  user-select: none;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease;
  &:hover {
    background-color: #4b688e;
  }
`;

const CardSetButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px;
  padding: 0 16px;
  border-radius: 8px;
  background-color: #adbce5;
  cursor: pointer;
  user-select: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #889ccd;
  }
`;

/* Skeleton */
const skeletonAnimation = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;
const SkeletonWrapper = styled.div`
  margin: 60px auto 0 auto;
  max-width: 1160px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media only screen and (max-width: 639px) {
    width: 100%;
    padding: 0 20px 0 20px;
  }
`;

const SkeletonTitle = styled.div`
  align-self: flex-start;
  margin-bottom: 16px;
  width: 400px;
  height: 36px;
  border-radius: 8px;
  background: #e0e0e0;
  background-image: linear-gradient(90deg, #e0e0e0, #f0f0f0, #e0e0e0);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${skeletonAnimation} 1.5s infinite ease-in-out;
  @media only screen and (max-width: 639px) {
    width: 50%;
  }
`;

const SkeletonCard = styled.div`
  margin-bottom: 16px;
  width: 600px;
  height: 400px;
  background: #e0e0e0;
  background-image: linear-gradient(90deg, #e0e0e0, #f0f0f0, #e0e0e0);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${skeletonAnimation} 1.5s infinite ease-in-out;
  @media only screen and (max-width: 639px) {
    width: 100%;
    aspect-ratio: 3/2;
  }
`;

const SkeletonProgressBar = styled.div`
  margin-bottom: 24px;
  width: 100%;
  height: 20px;
  border-radius: 4px;
  background: #e0e0e0;
  background-image: linear-gradient(90deg, #e0e0e0, #f0f0f0, #e0e0e0);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${skeletonAnimation} 1.5s infinite ease-in-out;
`;

const SkeletonDescriptionBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  @media only screen and (max-width: 639px) {
  }
`;

const SkeletonAvatar = styled.div`
  margin-right: 16px;
  height: 64px;
  width: 64px;
  border-radius: 50%;
  background: #f0f0f0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonAnimation} 1.5s infinite;
`;

const SkeletonDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const SkeletonAuthorName = styled.p`
  margin-bottom: 16px;
  height: 16px;
  width: 280px;
  background: #f0f0f0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonAnimation} 1.5s infinite;
  border-radius: 4px;
  @media only screen and (max-width: 639px) {
  }
`;

const SkeletonDescription = styled.div`
  height: 40px;
  width: 440px;
  background: #f0f0f0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${skeletonAnimation} 1.5s infinite;
  border-radius: 8px;
  @media only screen and (max-width: 639px) {
    width: 360px;
  }
`;

function CardContent({ currentStyle, currentTemplate, currentCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCard]);

  const handleFlipCardWithKeyboard = useCallback((event) => {
    const tagName = event.target.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") {
      return;
    }

    switch (event.key) {
      case " ":
        event.preventDefault();
        handleFlip();
        break;
      default:
        return;
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleFlipCardWithKeyboard);

    return () => {
      window.removeEventListener("keydown", handleFlipCardWithKeyboard);
    };
  }, [handleFlipCardWithKeyboard]);

  return (
    <CardViewWrapper onClick={handleFlip}>
      <FlipCard $isFlipped={isFlipped} $currentStyle={currentStyle}>
        <FrontCard
          $isFlipped={isFlipped}
          $currentStyle={currentStyle}
          currentCard={currentCard}
        >
          {currentCard &&
            currentTemplate.frontFields.map((field, index) => {
              const currentFrontField = currentCard.frontFields[index];
              return (
                <FieldContainer
                  key={index}
                  $style={field.style}
                  $position={field.position}
                >
                  {renderFieldContent(
                    field,
                    currentFrontField ? currentFrontField.value : ""
                  )}
                </FieldContainer>
              );
            })}
        </FrontCard>
        <BackCard $isFlipped={isFlipped} $currentStyle={currentStyle}>
          {currentCard &&
            currentTemplate.backFields.map((field, index) => {
              const currentBackField = currentCard.backFields[index];
              return (
                <FieldContainer
                  key={index}
                  $style={field.style}
                  $position={field.position}
                >
                  {renderFieldContent(
                    field,
                    currentBackField ? currentBackField.value : ""
                  )}
                </FieldContainer>
              );
            })}
        </BackCard>
      </FlipCard>
    </CardViewWrapper>
  );
}

const renderFieldContent = (field, value) => {
  switch (field.type) {
    case "text":
      return value;

    case "image":
      if (value && value.trim() !== "") {
        return <Image src={value} alt={field.name} $style={field.style} />;
      }
      return null;

    default:
      return null;
  }
};

const getResponsiveFontSize = (fontSizeValue) => {
  let sizes;

  switch (fontSizeValue) {
    case "xs":
      sizes = { small: "8px", medium: "10px", large: "12px" };
      break;
    case "s":
      sizes = { small: "12px", medium: "14px", large: "18px" };
      break;
    case "m":
      sizes = { small: "16px", medium: "18px", large: "24px" };
      break;
    case "l":
      sizes = { small: "20px", medium: "22px", large: "30px" };
      break;
    case "xl":
      sizes = { small: "24px", medium: "26px", large: "36px" };
      break;
    case "2xl":
      sizes = { small: "29px", medium: "30px", large: "42px" };
      break;
    default:
      sizes = { small: "16px", medium: "20px", large: "24px" };
  }

  return css`
    font-size: ${sizes.small};

    @media (min-width: 600px) {
      font-size: ${sizes.medium};
    }

    @media (min-width: 1024px) {
      font-size: ${sizes.large};
    }
  `;
};

const CardViewWrapper = styled.div`
  align-self: center;
  display: block;
  margin: 12px 0px;
  width: 100%;
  max-width: 580px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    margin: 32px 0px;
  }
`;

const FlipCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  transform-style: preserve-3d;
  transition: ${(props) => {
    switch (props.$currentStyle.animation) {
      case "fade":
        return "opacity 0.5s ease-in-out";
      default:
        return "all 0.5s ease-in-out";
    }
  }};
  transform: ${(props) => {
    switch (props.$currentStyle.animation) {
      case "horizontalFlip":
        return props.$isFlipped ? "rotateY(180deg)" : "rotateY(0)";
      case "fade":
        return "none";
      default:
        return props.$isFlipped ? "rotateX(180deg)" : "rotateX(0)";
    }
  }};
  border-radius: ${(props) => props.$currentStyle.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
  &:hover {
    transform: ${(props) => {
      switch (props.$currentStyle.animation) {
        case "horizontalFlip":
          return props.$isFlipped ? "rotateY(175deg)" : "rotateY(2deg)";
        case "fade":
          return "none";
        default:
          return props.$isFlipped ? "rotateX(175deg)" : "rotateX(2deg)";
      }
    }};
    box-shadow: 0 20px 20px rgba(50, 60, 60, 0.2);
  }
`;

const FrontCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  overflow: auto;
  outline-style: ${(props) => props.$currentStyle.borderStyle};
  outline-color: ${(props) => props.$currentStyle.borderColor};
  outline-width: ${(props) => props.$currentStyle.borderWidth};
  background-color: ${(props) => props.$currentStyle.backgroundColor};
  border-radius: ${(props) => props.$currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.$currentStyle.fontFamily};
  font-size: 32px;
  opacity: ${(props) =>
    props.$currentStyle.animation === "fade" && props.$isFlipped ? 0 : 1};
  transition: ${(props) =>
    props.$currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
`;

const BackCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  overflow: auto;
  outline-style: ${(props) => props.$currentStyle.borderStyle};
  outline-color: ${(props) => props.$currentStyle.borderColor};
  outline-width: ${(props) => props.$currentStyle.borderWidth};
  background-color: ${(props) => props.$currentStyle.backgroundColor};
  border-radius: ${(props) => props.$currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.$currentStyle.fontFamily};
  transform: ${(props) => {
    switch (props.$currentStyle.animation) {
      case "horizontalFlip":
        return "rotateY(180deg)";
      case "fade":
        return "none";
      default:
        return "rotateX(180deg)";
    }
  }};
  font-size: 32px;
  opacity: ${(props) =>
    props.$currentStyle.animation === "fade" ? (props.$isFlipped ? 1 : 0) : 1};
  transition: ${(props) =>
    props.$currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
  z-index: ${(props) => (props.$isFlipped ? 3000 : 0)};
`;

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: ${(props) => props.$style.textAlign || "center"};
  align-items: center;
  ${(props) =>
    props.$style &&
    css`
      width: ${props.$style.width};
      height: ${props.$style.height};
      font-weight: ${props.$style.fontWeight};
      color: ${props.$style.color};
      font-style: ${props.$style.fontStyle};
      ${getResponsiveFontSize(props.$style.fontSize)};
    `}
  left: ${(props) => props.$position?.x};
  top: ${(props) => props.$position?.y};
  user-select: none;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${(props) => props.$style?.objectFit || "cover"};
  display: block;
`;

CardContent.propTypes = {
  currentTemplate: PropTypes.shape({
    templateName: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
    backFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
  currentStyle: PropTypes.shape({
    styleId: PropTypes.string,
    userId: PropTypes.string.isRequired,
    styleName: PropTypes.string.isRequired,
    borderStyle: PropTypes.oneOf(["none", "solid", "dashed", "dotted"]),
    borderColor: PropTypes.string,
    borderWidth: PropTypes.string,
    borderRadius: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
    animation: PropTypes.oneOf(["verticalFlip", "horizontalFlip", "fade"])
      .isRequired,
  }).isRequired,
  currentCard: PropTypes.shape({
    cardId: PropTypes.string.isRequired,
    cardSetId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    backFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    createdAt: PropTypes.object.isRequired,
  }).isRequired,
};
