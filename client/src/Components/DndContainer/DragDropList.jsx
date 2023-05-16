import React, { useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../StrictModeDroppable';
import { reorder } from '../../utility/reorder';
import DragDropRow from './DragDropRow';
import { getDroppableStyle, getDraggableStyle } from './styles/DragDropListStyles';

const ACTION = {
  UPDATE_ITEMS: 'updateItems',
  UPDATE_HOVER_STATE: 'updateHoverState',
  UPDATE_DRAG_STATE: 'updateDragState',
  REMOVE_ITEM: 'removeItem'
}

const reducer = (state, action) => {
  switch(action.type) {
    case ACTION.UPDATE_ITEMS:
      return { ...state, items: action.payload };
    case ACTION.UPDATE_HOVER_STATE:
      return { ...state, hoverStates: action.payload };
    case ACTION.UPDATE_DRAG_STATE:
      let newDragStates = state.dragStates;
      newDragStates[action.payload.index] = action.payload.newState;
      return { ...state, dragStates: newDragStates };
    case ACTION.REMOVE_ITEM:
      let newItems = state.items.filter((_, index) => index !== action.payload.index);
      return { ...state, items: newItems }
    default:
      throw new Error('Unhandled action');
  }
}

const getItems = (props) => {
  const count = Number(props.rowCount) || 5;
  let children = props.children ? JSON.parse(JSON.stringify(props.children)) : [];
  
  for(let i = 0; i < count; i++)
    children.push(<DragDropRow />);
  
  return children;  
}  

const getItemsWithState = (state, dispatch) =>
{
  let children = React.Children.map(state.items, (child, index) => {
    if (React.isValidElement(child)) {
      const newChild = React.cloneElement(child, {
        id: `item-${index}`,
        index: index
      });  
      return newChild;
    }  

    return child;
  });  

  //Object.preventExtensions(children);
  return children;
}  

function DragDropList(props)
{
  const [state, dispatch] = useReducer(reducer, {
    items: getItems(props),
    hoverStates: Array(Number(props.rowCount) || 5).fill(false),
    dragStates: Array(Number(props.rowCount) || 5).fill(0)
  });

  function handleDragUpdate(result) {
    // dropped outside the list
    let dragState = state.dragStates[result.source.index] === 2 ? 2 : (!result.destination ? 1 : 0);
    dispatch({type: ACTION.UPDATE_DRAG_STATE, payload: {index: result.source.index, newState: dragState}});
    console.log(`[DragState]: ${state.dragStates[result.source.index]}`);
  }

  function handleDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      dispatch({type: ACTION.UPDATE_DRAG_STATE, payload: {index: result.source.index, newState: 2}});
      // TODO: It would seem that the `ANIMATING` log message is always called (and the animation finishes)
      //  before we ever reach this point... So perhaps it might be best to move the styling code there?
      //  Maybe we should even just have individual item styles be a member of `state`?
      console.log("DRAG ENDED!!");
      handleRemoveElement(result.source.index);
      return;
    }

    const newItems = reorder(
      state.items,
      result.source.index,
      result.destination.index
    );

    dispatch({ type: ACTION.UPDATE_ITEMS, payload: newItems });
  }

  const handleMouseEnter = (e, index) => {
    const hoverState = [...state.hoverStates];
    hoverState[index] = true;
    console.log(e.currentTarget);
    dispatch({ type: ACTION.UPDATE_HOVER_STATE, payload: hoverState });
  }

  const handleMouseMove = (e, index) => {
    const hoverState = [...state.hoverStates].map(_ => false);
    hoverState[index] = true;
    dispatch({ type: ACTION.UPDATE_HOVER_STATE, payload: hoverState });
  }

  const handleMouseLeave = (e, index) => {
    const hoverState = [...state.hoverStates];
    hoverState[index] = false;
    dispatch({ type: ACTION.UPDATE_HOVER_STATE, payload: hoverState });
  }

  const handleRemoveElement = (index) => {
    dispatch({ type: ACTION.REMOVE_ITEM, payload: index });
  }

  const getContent = (provided, snapshot) =>
  {
    state.items = getItemsWithState(state, dispatch);
    return (
      <div
        {...provided.droppableProps}
        ref={provided.innerRef}
        style={ getDroppableStyle(snapshot.isDraggingOver) }>
        {state.items.map((item, index) => (
          <Draggable key={item.props.id} draggableId={`draggable-${index}`} index={index}>
            {(provided, snapshot) => (
              
              <Container
                //className={ getItemClassName(isHoveringListItem === index, snapshot.isDragging) }
                ref={ provided.innerRef }
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={ getDraggableStyle(index, state, snapshot, provided) }
                onMouseEnter={e => handleMouseEnter(e, index)}
                onMouseLeave={e => handleMouseLeave(e, index)}
                onMouseMove={e => handleMouseMove(e, index)}>
                  {state.items[index]}
              </Container>

            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <Droppable droppableId="droppable-list">
        {(provided, snapshot) => (
          <>
            {getContent(provided, snapshot)}
          </>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default DragDropList;