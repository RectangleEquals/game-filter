import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { RxDragHandleHorizontal } from 'react-icons/rx';
import { FaSearchengin } from 'react-icons/fa';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function AddButton(props)
{
  return (
    <div className="d-flex flex-column justify-content-center">
      <Button variant="success" onClick={props.onAddField}>
        <AiOutlineAppstoreAdd className="m-2 p-0"/>Add Logic
      </Button>
    </div>
  )
}

function SearchButton(props) {
  const variantStyle = props.disabled ? "secondary" : "primary";
  const onSubmit = props.disabled ? () => {} : props.onSubmit;

  return (
    <div className="flex m-1 p-0 shadow-lg">
      <Button variant={variantStyle} className="shadow" onClick={onSubmit}>
        <FaSearchengin className="m-2 me-3" />
        Find Games
      </Button>
    </div>
  );
}

function getFormSelectClass(value) {
  return value === '' ? "text-secondary me-2 p-1" : "text-dark me-2 p-1";
}

function DynamicFieldRow(props)
{
  return(
    <Row className="m-0 p-0">

      <Col className="m-0 p-0">
        {props.fields.map((field, index) => (
          <div key={index} className="d-flex align-items-center bg-dark p-1 mt-2 mb-2 rounded-lg">
            <RxDragHandleHorizontal className="text-light me-2"/>
            <Form.Select value={field} onChange={e => props.onChangeField(e.target.value, index)} className={getFormSelectClass(field)}>
              <option value="" className="text-secondary">Select an option</option>
              <option value="Option 1" className="text-dark">Option 1</option>
              <option value="Option 2" className="text-dark">Option 2</option>
              <option value="Option 3" className="text-dark">Option 3</option>
            </Form.Select>
            <Button variant="outline-danger" className="btn-close btn-close-white m-2" onClick={() => props.onRemoveField(index)} />
          </div>
        ))}

        <AddButton onAddField={props.onAddField} />
      </Col>

    </Row>
  )
}

function DynamicFields()
{
  let [fields, setFields] = useState(['']);

  const handleAddField = function() {
    setFields(fields => [...fields, '']);
  };

  const handleRemoveField = function(index) {
    setFields(fields => fields.filter((_, i) => i !== index));
  };

  const handleChangeField = function(value, index) {
    setFields(fields => {
      const newFields = [...fields];
      newFields[index] = value;
      return newFields;
    });
  };

  const handleSubmit = function(e) {
    e.preventDefault();
    console.log('Fields:', fields);
    // Handle form submission logic here
  };

  const DynamicSearchButton = function()
  {
    if(fields && fields.length > 0 && fields.filter(value => value !== '').length === fields.length) {
      return (
        <div className="m-2 pt-2 pb-2 d-flex justify-content-center">
          <SearchButton onSubmit={handleSubmit} />
        </div>
      )
    }

    return (
      <div className="m-2 pt-2 pb-2 d-flex justify-content-center">
        <SearchButton disabled='true' />
      </div>
    )
  }

  return(
    <Container>
      <Container className="bg-dark rounded p-2 mt-4 mb-4 shadow-lg">
        <DynamicFieldRow
          fields={fields}
          onAddField={handleAddField}
          onRemoveField={handleRemoveField}
          onChangeField={handleChangeField}
        />
      </Container>

      {DynamicSearchButton()}
    </Container>
  );
}

export default DynamicFields;