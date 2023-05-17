import { Form, Row, Col } from 'react-bootstrap';
import { RxDragHandleHorizontal } from 'react-icons/rx';

let self;

const getSelectStyle = () => {
  return {
    zIndex: 2
  };
}

const DragDropRow = Object.assign(props =>
{
  return (
    <>
      <Row >
        <Col>
          <div key={props.index} className="d-flex align-items-center bg-dark p-1 mt-2 mb-2 rounded-lg">
            <RxDragHandleHorizontal className="text-light me-2" />
            <Form.Select className="me-2 p-1" style={getSelectStyle()} onMouseDown={e => {
              console.log("MouseDown!");
              e.currentTarget.focus();
              var isFocused = (document.activeElement === e.currentTarget);
              if(!isFocused) {
                e.stopPropagation();
                const event = new MouseEvent("mousedown");
                e.currentTarget.dispatchEvent(event);
              }
            }}>
              <option value="" className="text-secondary">Select an option</option>
              <option value="Option 1" className="text-dark">Option 1</option>
              <option value="Option 2" className="text-dark">Option 2</option>
              <option value="Option 3" className="text-dark">Option 3</option>
            </Form.Select>
          </div>
        </Col>
      </Row>
    </>
  );
},
{ displayName: 'DragDropRow' });

self = DragDropRow;
export default DragDropRow;