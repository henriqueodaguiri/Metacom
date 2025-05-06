import { Fragment, useState } from "react";
import { FaEye, FaEyeSlash, FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { Container, Table, TableRow, TableHeader, TableCell, ToggleButton, ChoicesRow } from "./styles";

export function QuestionsTable({ questions, setQuestions, handleEdit }) {
  const [expandedRows, setExpandedRows] = useState([]);

  function handleToggleChoices(index) {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  }

  function handleRemove(index) {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  }
  
  return (
    <Container>
      <Table>
        <thead>
          <TableRow>
            <TableHeader>Pergunta</TableHeader>
            <TableHeader>Ações</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {questions.map((question, i) => (
            <Fragment key={i}>
              <TableRow>
                <TableCell>{`${i + 1} - ${question.statement}`}</TableCell>
                <TableCell>
                  <ToggleButton onClick={() => handleToggleChoices(i)}>
                    {expandedRows.includes(i) ? <FaEyeSlash /> : <FaEye />}
                  </ToggleButton>
                  <FaPencilAlt onClick={() => handleEdit(i)}/>
                  <FaTrashAlt onClick={() => handleRemove(i)}/>
                </TableCell>
              </TableRow>
              {expandedRows.includes(i) && (
                <ChoicesRow>
                  <td colSpan="2">
                    <ul>
                      {
                        question.choices.map((choice, i) => (
                          <li 
                            key={i} 
                            className={choice.isCorrect ? "correct" : "incorrect"}
                          >
                           {`${String.fromCharCode(97 + i)}) ${choice.content}`}
                          </li>
                        ))
                      }
                    </ul>
                  </td>
                </ChoicesRow>
              )}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}