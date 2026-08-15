import React,{useState} from 'react'
import logo from '../data/logo.png'
import { questions, quiz } from '../data/questions'
import { Link } from 'react-router-dom'
import {IoIosArrowBack} from 'react-icons/io'
const Quiz = () => {
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState("");

    const selectAnswer = (questionId, optionId) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [questionId]: optionId,
        }));

        setError("");
    };

    const submitQuiz = () => {
        const unansweredQuestions = questions.filter(
            (question) => !answers[question.id]
        );

        if (unansweredQuestions.length > 0) {
            setError(
            `You have ${unansweredQuestions.length} unanswered question${
                unansweredQuestions.length === 1 ? "" : "s"
            }.`
            );

            return;
        }

        const finalScore = questions.reduce((total, question) => {
            const isCorrect =
            answers[question.id] === question.correctOptionId;

            return total + (isCorrect ? 1 : 0);
        }, 0);

        setScore(finalScore);
        setShowResults(true);
        setError("");
    };

    const tryAgain = () => {
        setAnswers({});
        setScore(0);
        setShowResults(false);
        setError("");
    };
    
    const percentage = Math.round(
        (score / questions.length) * 100
    );


  return (
    <div className=' m-auto w-7/12'>
        <div className='font-bold text-[30px] text-center mt-9 flex justify-between items-center'>
            <img src={logo} alt='logo' className='w-64 block ml-auto mr-auto  mt-9'/>
            <p><span>QuiZ</span><span className='text-[#f57328]'>ote</span></p>
          </div>


        <div className='bg-white mt-3 p-6 rounded-xl shadow-lg'>
            {/* Header */}
            <h1 className='flex justify-center text-3xl m-3 font-bold'>{quiz.title}</h1>
            <hr />

            {/* Question Card */}

            <div className='p-6 tracking-wider'>
            

                {
                    showResults?(
                        <div className='font-bold'>
                            {/* {reward?(<p className='text-center text-green-600 font-bold mt-4'>Congratulations, you have earned airtime!</p>) :(<p>you can try again to win airtime</p>)} */}
                            <h1 className='flex justify-center mb-3'>Final Results</h1>
                            <h2 className='flex justify-center mb-3'>{score} out of {questions.length} correct  ({percentage}%)</h2>
                            <p>
                            {percentage >= quiz.passingPercentage
                                ? "Well done! You passed the quiz."
                                : "Review the explanations and try again."}
                            </p>

                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 leading-tight'
                                type="button" onClick={tryAgain}
                            >
                                Try Again
                            </button>
                        </div>


                    ):(
                    <div className='mb-5'>
                       {
                            questions.map((question,index)=>(
                                    
                                <form key={question.id} >
                                    <h2 className='font-bold mt-4'>Question:{index+1}</h2>
                                    <p>{question.prompt}</p>
                                    {question.options.map((option)=>(
                                        <React.Fragment key={option.id}>
                                            <input
                                                type="radio"
                                                id={`${question.id}-${option.id}`}
                                                name={question.id}
                                                value={option.id}
                                                checked={answers[question.id] === option.id}
                                                onChange={() => selectAnswer(question.id, option.id)}
                                            />

                                            <label htmlFor={`${question.id}-${option.id}`}>
                                                {option.text}
                                            </label> 
                                            
                                            <br />
                                        </React.Fragment>

                                    ))}
                                </form>
                                ))
                        }
                        <div className='flex justify-between mt-6'>
                            <Link to='/'>
                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 '
                            
                            >
                                <div className='flex leading-tight'>
                                <IoIosArrowBack />
                                <IoIosArrowBack/>
                                    Back    
                                </div>

                            </button> 
                            </Link>

                            {error && (
                                <p role="alert" className="text-red-600">
                                    {error}
                                </p>
                            )}

                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 leading-tight'
                                type="button" onClick={submitQuiz}
                            >
                                Submit quiz
                            </button>   
                          
                        </div>



                            
                    </div>
                    


                    )
                }

               
              
            </div>
        </div>
        

    </div>
  )
}

export default Quiz