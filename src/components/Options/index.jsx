"use client";
import { Container, Question, QuestionOptions } from "./styles";
import { ChoiceInput } from "@/components/ChoiceInput";

export function Options({ done, questions, setQuestions }) {
  function handleCheck(question, choiceId) {
    const updatedQuestions = questions.map(q => 
      q === question ? { ...q, selectedChoiceId: choiceId } : q
    );

    setQuestions(updatedQuestions);
  }

  return (
    <Container>
      {
        questions.map((q, i) => (
          <Question key={i}>
            <h3>{q.statement}</h3>
            {
              q.choices.map((c, i) => {
                const letter = String.fromCharCode(97 + i);

                return (
                  <QuestionOptions key={c.id}>
                    <p>{letter})</p> 
                    <ChoiceInput 
                      disable
                      value={c.content}
                      checked={c.id === q.selectedChoiceId} 
                      done={done}
                      isCorrect={c.isCorrect}
                      onCheck={() => handleCheck(q, c.id)}
                    />
                  </QuestionOptions>
                );
              })
            }
          </Question>  
        ))
      }
    </Container>
  );
}