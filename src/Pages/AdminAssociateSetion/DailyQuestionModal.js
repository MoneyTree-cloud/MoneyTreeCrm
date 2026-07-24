/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { GET_Q_A_BY_ID, SAVE_Q_A } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";

export default function DailyQuestionModal({ userId }) {
    const [modal, setModal] = useState(false);
    const [questionData, setQuestionData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const { empCode } = useUserStore((state) => state.user);
    const today = new Date().toISOString().split("T")[0];
    const [resultModal, setResultModal] = useState(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
    const [correctAnswerText, setCorrectAnswerText] = useState("");

    useEffect(() => {
        if (!userId) return;
        // const answeredDate = localStorage.getItem("dailyQuestionAnswered");
        // if (answeredDate === today) return;
        getQuestion();
    }, []);

    /* FETCH QUESTION */
    const getQuestion = () => {

        ApiClient.get(`${GET_Q_A_BY_ID}${userId}&date=${today}`)
            .then((res) => {

                const response = res?.data;

                if (!response || response.status !== 1) return;

                const questions = response.data;

                if (!Array.isArray(questions) || questions.length === 0) return;

                const activeQuestions = questions.filter(q => q.isActive === "YES");

                if (activeQuestions.length === 0) return;

                const randomQuestion =
                    activeQuestions[Math.floor(Math.random() * activeQuestions.length)];

                setQuestionData(randomQuestion);
                setModal(true);

            })
            .catch(() => {
                toast.error("Failed to load question");
            });

    };

    /* SUBMIT ANSWER */
    const handleSubmit = () => {

        if (selectedOption === null) {
            toast.error("Please select an option");
            return;
        }

        const correctOption = questionData.options.find(o => o.true);
        setSubmitted(true);

        let params = {
            "totalpoint": "10",
            "achievedpoint": questionData.options[selectedOption].true ? '10' : '0',
            "empCode": empCode,
            "questionId": questionData?.id
        }
        ApiClient.post(SAVE_Q_A, params)
            .then(function (response) {
                setSubmitted(false);
                setModal(false);
                if (response?.data?.status === 1) {
                    // localStorage.setItem("dailyQuestionAnswered", today);
                    if (response?.data?.status === 1) {

                        const isCorrect = questionData.options[selectedOption].true;

                        setIsCorrectAnswer(isCorrect);
                        setCorrectAnswerText(correctOption.option);
                        setResultModal(true);

                    }
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setSubmitted(false);
                toast.error(error.message);
            });
    };

    return (
        <>
            <Modal isOpen={modal} centered backdrop="static" size="md">
                <ModalHeader className="quiz-header">
                    🧠 Knowledge Check
                </ModalHeader>
                <ModalBody>
                    {questionData && (
                        <div className="quiz-container">
                            <div className="question-box">
                                {questionData?.question}
                            </div>

                            <div className="options-container">

                                {questionData?.options?.map((opt, index) => {

                                    const isSelected = selectedOption === index;
                                    const isCorrect = opt.true;

                                    let optionClass = "option-card";

                                    if (submitted && isCorrect) optionClass += " correct";
                                    else if (submitted && isSelected && !isCorrect) optionClass += " wrong";
                                    else if (isSelected) optionClass += " selected";

                                    return (

                                        <div
                                            key={index}
                                            className={optionClass}
                                            onClick={() => !submitted && setSelectedOption(index)}
                                        >

                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                readOnly
                                            />

                                            <span>{opt.option}</span>

                                        </div>

                                    );

                                })}

                            </div>

                            {!submitted && (

                                <Button
                                    className="submit-btn"
                                    onClick={handleSubmit}
                                >
                                    Submit Answer
                                </Button>

                            )}

                        </div>

                    )}

                </ModalBody>

            </Modal>

            <Modal isOpen={resultModal} centered>
                <ModalHeader toggle={() => setResultModal(false)}>
                    Result
                </ModalHeader>

                <ModalBody style={{ textAlign: "center", padding: "30px" }}>

                    {isCorrectAnswer ? (
                        <>
                            <h3 style={{ color: "#22c55e" }}>🎉 Correct Answer!</h3>
                            <p>Great job!</p>
                        </>
                    ) : (
                        <>
                            <h3 style={{ color: "#ef4444" }}>❌ Wrong Answer</h3>
                            <p>
                                Correct Answer: <b>{correctAnswerText}</b>
                            </p>
                        </>
                    )}

                    <Button
                        color="primary"
                        style={{ marginTop: "15px" }}
                        onClick={() => setResultModal(false)}
                    >
                        OK
                    </Button>

                </ModalBody>
            </Modal>

            <style jsx="true">{`

        .quiz-header{
          text-align:center;
          font-weight:600;
          font-size:18px;
        }

        .quiz-container{
          padding:10px;
        }

        .question-box{
          font-size:18px;
          font-weight:600;
          margin-bottom:20px;
          text-align:center;
        }

        .options-container{
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .option-card{
          display:flex;
          align-items:center;
          gap:12px;
          border:1px solid #e5e5e5;
          padding:14px;
          border-radius:8px;
          cursor:pointer;
          transition:all .25s ease;
          background:#fff;
        }

        .option-card:hover{
          border-color:#0f766e;
          transform:scale(1.02);
        }

        .option-card.selected{
          border:2px solid #0f766e;
          background:#f0fdfa;
        }

        .option-card.correct{
          border:2px solid #22c55e;
          background:#ecfdf5;
        }

        .option-card.wrong{
          border:2px solid #ef4444;
          background:#fef2f2;
        }

        .submit-btn{
          width:100%;
          margin-top:20px;
          background:#0f766e !important;
          border:none !important;
          padding:10px;
          font-weight:600;
          border-radius:6px;
        }

      `}</style>

        </>

    );

}