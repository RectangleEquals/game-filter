import { COLORS, colorWithOpacity } from '../../../utility/colors';

export const styles =
{
  list: {
    default: {
      background: "rgba(28,28,28,0.8)",
      padding: 0,
      margin: 0,
      width: 400,
      transition: "margin 0.2s, padding 0.4s, background 0.4s ease 0.15s",
      //transitionDuration: "0.5s"
    },
    draggingOver: {
      background: colorWithOpacity(COLORS.BLACK.rgb, 0.4),
      padding: 2,
      margin: 4,
      width: 400,
      transition: "margin 0.2s, padding 0.4s, background 0.4s ease 0.15s",
      //transitionDuration: "0.5s"
    }
  },
  items: {
    default: {
      background: COLORS.DARK.rgb,
      color: COLORS.LIGHT.rgb,
      userSelect: "none",
      padding: "0 16px 0 16px",
      margin: "0 0 0 0",
      transition: "margin 0.2s, padding 0.2s, background 0.5s, color 0.2s",
      //transitionDuration: "0.5s"
    },
    hoveringOver: {
      background: "rgba(120, 120, 120, 0.6)",
      color: COLORS.DARK.rgb,
      userSelect: "none",
      padding: "0 16px 0 16px",
      margin: "0 0 0 0",
      transition: "margin 0.2s, padding 0.2s, background 0.5s, color 0.2s",
      //transitionDuration: "0.5s"
    },
    dragging: {
      background: "rgb(192, 192, 192, 0.9)",
      color: COLORS.DARK.rgb,
      userSelect: "none",
      padding: "0px 8px 0 8px",
      margin: "0 0 0 0",
      transition: "margin 0.2s, padding 0.2s, background 0.5s, color 0.2s",
      //transitionDuration: "0.5s"
    },
    deleting: {
      // Separated and added below due to requiring
      //  a portion of this completed JSON object
    }
  }
}

// Add a style for an item undergoing deletion
styles.items = {...styles.items, deleting: {
  ...styles.items.default,
  background: "rgb(0, 0, 0, 0.1)",
  color: "rgb(0, 0, 0, 0.1)",
  opacity: "0.1",
  transition: "margin 0.2s, padding 0.2s, background 0.5s, color 0.2s, opacity: 0.33s",
  transitionDuration: "0.5s"
  //transitionDuration: "0.001s"
}}

export const getDroppableStyle = (isDraggingOver) => {
  const style = isDraggingOver ? styles.list.draggingOver : styles.list.default;
  return style;
};

export const getDraggableStyle = (index, state, snapshot, provided) =>
{
  const isBeingRemoved = state.dragStates[index] === 2;
  if(isBeingRemoved)
    console.log("REMOVING!!");
  if(snapshot.isDropAnimating) {
    console.log("ANIMATING!!");
    //isBeingRemoved = true;
  }

  const draggableStyle = provided.draggableProps.style;
  const isHoveringOver = state.hoverStates[index];
  const style = 
    isBeingRemoved ? styles.items.deleting :
    snapshot.isDragging ? styles.items.dragging : 
    isHoveringOver ? styles.items.hoveringOver : styles.items.default;
  const newStyle = { ...style, ...draggableStyle };
  
  return {
    ...styles.draggable,
    ...(snapshot.isDragging && styles.draggableDragging),
    ...draggableStyle
  }
  //return ({...newStyle});
}

/*
export const getDroppableStyle = isDraggingOver => ({
  ...styles.droppable,
  ...(isDraggingOver && styles.droppableDragging)
});

export const getDraggableStyle = (isDragging, draggableStyles) => ({
  ...styles.draggable,
  ...(isDragging && styles.draggableDragging),
  ...draggableStyles
});
*/

export default { getDroppableStyle, getDraggableStyle };