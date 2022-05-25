import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { red } from "@mui/material/colors";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";

// material UI styled Table Cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

// material UI styled Table Row
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const TodoList = () => {
  const [taskInput, setTaskInput] = useState([]);
  const [oldEditTaskInput, setOldTaskInput] = useState([]);
  const [deleteArray, setDeleteArray] = useState([]);
  const [undoArray, setUndoArray] = useState([]);
  const [viewUse, setViewUse] = useState(false);
  const [undoButton, setUndoButton] = useState(false);
  const [editButton, setEditButton] = useState(false);
  const [emptyArray, setEmptyArray] = useState(false);
  const [emptyString, setEmptyString] = useState("");
  const [editIndex, setEditIndex] = useState("");
  const [currentTime, setCurrentTime] = useState();
  const [taskListData, setTaskListData] = useState([]);
  const taskInputRef = useRef();
  const dateNow = new Date();
  let todaysDate = dateNow.toDateString();

  // get new updated array every time any changes are done as its dependent on viewUse
  // state of viewUse will be reversed on all of the functions to refresh the list
  useEffect(() => {
    setTaskListData(taskList());
  }, [viewUse]);

  // update the state of current time every 1 sec
  useEffect(() => {
    setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
  }, []);

  // fucntion for getting the current local storage value
  // as local storage accepts only string values we have to convert them to string using JSON.stringify()
  // and then later parse it using JSON.parse to use them
  const taskList = () => {
    return JSON.parse(localStorage.getItem("taskName"));
  };

  // to enter values in the input field and update its state
  const taskHandler = (e) => {
    setTaskInput(e.target.value);
  };

  // task submit function
  const taskSubmit = () => {
    if (taskInput !== "") {
      // get old data and set empty array if its value null
      // every first time the value of a local stoare key will be null so we have to set this
      if (localStorage.getItem("taskName") === null) {
        localStorage.setItem("taskName", "[]");
      }

      // get old array and parse it so that it can be used to alter the data
      var old_data = JSON.parse(localStorage.getItem("taskName"));

      // creating new object for storing task information
      // we will store multiple objects to save all the task names and time
      const taskobj = {
        task: taskInput,
        time: Date(),
      };

      //append new values in the old array so that we display the list with new added task
      old_data.push(taskobj);

      // set new array which we created in local storage and stringify it as local storage accepts only string values
      localStorage.setItem("taskName", JSON.stringify(old_data));

      // changing state for refreshing the list
      setViewUse(!viewUse);

      // emptying the input field
      setTaskInput("");
    }
  };

  // function for deleting a single task
  const deleteTask = (index) => {
    // getting the current array value so that it can be used to remove a given element
    const oldArray = JSON.parse(localStorage.getItem("taskName"));

    // keeping a backup/copy of the old array before deleting anything from it so that it can be used to revert when undo function is called
    setUndoArray([...oldArray]);

    // removing elements of the array as per the index of the element that is passed
    // first parameter that the splice function accepts is the index position
    // second parameter that the function accepts is the delete count which the number of elements that is to be deleted from the given index position
    oldArray.splice(index, 1);

    // setting the new array with the deleted element
    localStorage.setItem("taskName", JSON.stringify(oldArray));

    // setting the state of undo button to true once the element is deleted, this state will be used to render the undo button conditionally.
    setUndoButton(true);

    // updating the state to refresh the list of tasks
    setViewUse(!viewUse);

    // setting a timeout of 5 seconds so that the undo functionality can be reverted
    setTimeout(() => {
      // resetting the undo array for the next use
      setUndoArray([]);

      // setting the state to false to hide the undo button from the user
      setUndoButton(false);
      setViewUse(!viewUse);
    }, 5000);
  };

  // undo function for reverting the delete function
  const undoSingle = () => {
    // reverting the array to the clone verison of the array which was set in a different start state before deleting anything
    localStorage.setItem("taskName", JSON.stringify(undoArray));

    // setting the state to false to hide the undo button from the user
    setUndoButton(false);
    setViewUse(!viewUse);
  };

  // function which will be called when checkbox is clicked which will be used to add values to an array to store the index value of the selected checkbox items
  //which will be used to delete those specific items
  const CheckBoxCounter = (index, event) => {
    // getting the old value of the array which has the previous values
    //or the default value which is empty [] for the first time
    let old_delete_array = [...deleteArray];

    // if the check box tick is true(ticked)
    if (event.target.checked === true) {
      //taking the default values and the old values if any and then pushing/appending the index value of the selected checkbox item in the array
      old_delete_array.push(index);

      // setting the state of the delete array with the updated array
      setDeleteArray(old_delete_array);
    } else {
      // if the check box tick is false(unticked)

      // if the user ticks an item in the list and then unticks it we will get the index of the item
      // but we cannot directly use that value to splice or remove that item from the list as it will be the index the task array and not the delete list array
      // so we will search the delete array of the value of the index and then find its index in the delete array using indexOf function
      var myIndex = old_delete_array.indexOf(index);

      // checking if the index value is not an negative integer
      if (myIndex !== -1) {
        // taking the index value and then using splice to delete or remove the element from the specific position
        old_delete_array.splice(myIndex, 1);
      }
      // setting the updated array with the array in which we reomved the unticked item
      setDeleteArray(old_delete_array);
    }
  };

  // once we get the index values of the elements that have the ticked checkbox and then store it in an array,
  // we will make use of the elements in that deleteArray to splice or remove the items from the task array
  const deleteMultipleTask = () => {
    // simple check to see whether the deleteArray is empty or not
    if (deleteArray.length !== 0) {
      // sorting the array as the for loop which we have defined below only works properly if the indexes are defined in an ascending order
      const sortedArray = deleteArray.sort(function (a, b) {
        return a - b;
      });
      // getting the current array value so that it can be used to remove the selected elements
      const oldArray = JSON.parse(localStorage.getItem("taskName"));

      // storing the array in a variable so that it gets a proper copy which can be altered later on
      let meOldArray = [...oldArray];

      // keeping a backup/copy of the old array before deleting anything from it so that it can be used to revert when undo function is called
      setUndoArray([...meOldArray]);

      // using for loop to loop through each element of the deleteArray one by one
      // initializing the value of i to be equal to the number of items in the delete array and then subtracting it by 1 as elements in an array start from 0
      // then if i is greater than or eqaul to 0 we will decrement the value of i so that we lopp through the items in the array from last to first as the initial value will be the index of the last value

      //overall this for loop will go through the deletedArray in reverse order and we can splice without messing up the indexes of the items yet in the loop
      for (var i = sortedArray.length - 1; i >= 0; i--) {
        // looping through the deleteArray we take the elements one by one as per the vlaue of i
        // we are accessing the element in the deletArray at the index i
        // first parameter that the splice function accepts is the index position which we will get from the elements of the delete array
        // second parameter that the function accepts is the delete count which the number of elements that is to be deleted from the given index position we set it to 1 to delete a single element
        meOldArray.splice(sortedArray[i], 1);
      }

      // setting using JSON.Stringify to set the new modified array in the local storage
      localStorage.setItem("taskName", JSON.stringify(meOldArray));

      // setting the state of the undo button conditionally render it
      setUndoButton(true);

      // resetting the delte array to be empty so that it new elemts can be stored next time
      setDeleteArray([]);

      // updating state to refresh the list
      setViewUse(!viewUse);

      // timeout for the undo functionality to be reverted
      setTimeout(() => {
        setUndoArray([]);
        setUndoButton(false);
        setViewUse(!viewUse);
      }, 5000);
    } else {
      // if no items are seleted show this error message
      setEmptyString("Please select some tasks to delete");
      setEmptyArray(true);
    }
  };

  // function for setting up the edit task functionality
  const editTask = (res, index) => {
    // here we receive res and the index value
    //we set the res value of the task selected to edit in the main input box
    setTaskInput(res.task);
    // set the res value in a different state to keep a copy to check if same values are being sent again and agaim
    setOldTaskInput(res.task);
    // set the index value in a state which will be used to update the task later on using the splice function
    setEditIndex(index);
    // setting the state of the edit button to be true so that the edit task submit button can be conditionally rendered
    setEditButton(true);
    // using the reference object of the input field to set focus once the edit button is clicked and the value of the task is filled in it
    taskInputRef.current.focus();
  };

  // fucntion for editing the values of the selected task
  const editTaskSubmit = () => {
    // after the edit button is clicked if nothing is updated which means that the new valued is equal to the old value
    // then we show the error message
    if (taskInput === oldEditTaskInput) {
      // error message
      setEmptyString("This Task is already created");
      // setting the state to true to conditionally render the error block
      setEmptyArray(true);
    } else {
      // if the task input field is not equal to empty
      if (taskInput !== "") {
        // get the current value of the array and parse it so that it can be altered later on
        var old_data = JSON.parse(localStorage.getItem("taskName"));
        // storing the array in a variable so that it gets a proper copy which can be altered later on
        let meold_data = [...old_data];
        // first parameter that the splice function accepts is the index position which we will get from edit index state which we had stored earlier in the setup function
        // second parameter that the function accepts is the delete count or the update count which is the number of elements that is to be deleted/updated from the given index position we set it to 1 to update a single element
        // third parameter of the splice function is the elements we want to add in the array, if we donot specify this splice will only delete the index value
        // in the third parameter we set the values from the text input and also pass the current time which will then be updated at the given index position
        meold_data.splice(editIndex, 1, { task: taskInput, time: Date() });

        // setting the local storage array with the new stringifed array with the edited values
        localStorage.setItem("taskName", JSON.stringify(meold_data));
        // reset the value of old task so that it can be used for any other task next time
        setOldTaskInput("");
        // reset the value of index state so that it can be used for any other task next time
        setEditIndex();
        // resetting the state of the button to false so that the edit task submit button can be hidden and the create task button should be shown again
        setEditButton(false);
        // setting the error block state to false so that it can be hidden
        setEmptyArray(false);
        // updating the stae for refresing the list
        setViewUse(!viewUse);
        setTaskInput("");
      } else {
        // if the input field is empty the task should not be updated
        setEmptyString("Task Cannot Be Empty");
        // setting error block to true
        setEmptyArray(true);
      }
    }
  };

  return (
    <>
      <Box sx={{ width: "90%", padding: "5%" }}>
        {/* current date and time */}
        <div>
          <strong>Todays Date :</strong> {todaysDate}
        </div>
        <br></br>
        <div>
          <strong>Current Time :</strong> {currentTime}
        </div>

        <br></br>
        <br></br>

        {/* text input for creating and editing task */}
        <TextField
          id="standard-basic"
          autoFocus
          inputRef={taskInputRef}
          label="Task Name"
          variant="standard"
          value={taskInput}
          onChange={taskHandler}
          sx={{ marginRight: "2%", width: "25%" }}
        />

        {/* submit button for creating and editing task */}
        {editButton ? (
          <>
            <Button
              onClick={() => editTaskSubmit()}
              variant="outlined"
              size="medium"
            >
              Update task
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => taskSubmit()}
              variant="outlined"
              size="medium"
            >
              Create Task
            </Button>
          </>
        )}

        {/* submit button for deleting multiple tasks */}
        <Button
          variant="outlined"
          onClick={() => deleteMultipleTask()}
          startIcon={<DeleteIcon />}
          sx={{ marginLeft: "2%" }}
        >
          Delete Multiple
        </Button>

        {/* conditionally rendering the undo button only when the stae is tru for 5 seconds */}
        {undoButton ? (
          <Button
            onClick={undoSingle}
            variant="outlined"
            size="medium"
            sx={{ marginLeft: "2%" }}
          >
            Undo
          </Button>
        ) : (
          <></>
        )}
        {emptyArray ? <div>{emptyString}</div> : <></>}
        <br></br>

        {/* table for showing all the tasks */}
        <TableContainer sx={{ paddingTop: "5%" }} component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Select</StyledTableCell>
                <StyledTableCell align="justify">Serial Number</StyledTableCell>
                <StyledTableCell align="justify">Task Name</StyledTableCell>
                <StyledTableCell align="justify">Created On</StyledTableCell>
                <StyledTableCell align="justify">Edit</StyledTableCell>
                <StyledTableCell align="left">Delete</StyledTableCell>
              </TableRow>
            </TableHead>

            {/* mapping the current task list array and rendereing each element of the array */}
            {taskListData === "[]" || taskListData === null
              ? "You haven't created any tasks"
              : taskListData.map((res, index) => {
                  // passing the time which we get from local storage to get the date in the date string format
                  const d = new Date(res.time);
                  const TaskDate = d.toDateString();
                  return (
                    <>
                      <TableBody>
                        <StyledTableRow key={res.task}>
                          <StyledTableCell component="th" scope="row">
                            {/* checkbox for the tasks to delete multiple items */}
                            <Checkbox
                              type="checkbox"
                              onClick={(event) => CheckBoxCounter(index, event)}
                              color="default"
                              sx={{
                                color: red[800],
                                "&.Mui-checked": {
                                  color: red[600],
                                },
                              }}
                            />
                          </StyledTableCell>
                          {/* taking the index value and adding it by 1 to get a serial number to show to the user */}
                          <StyledTableCell align="justify">
                            {index + 1}
                          </StyledTableCell>
                          {/* display tasks */}
                          <StyledTableCell align="justify">
                            {res.task}
                          </StyledTableCell>
                          {/* display the current time and using moment to show the time  */}
                          <StyledTableCell align="justify">
                            {`${TaskDate} (${moment(res.time)
                              .startOf("second")
                              .fromNow()})`}
                          </StyledTableCell>
                          {/* edit task button */}
                          <StyledTableCell align="justify">
                            <Button
                              variant="outlined"
                              key={index}
                              onClick={() => editTask(res, index)}
                            >
                              Edit
                            </Button>
                          </StyledTableCell>
                          {/* delete task button */}
                          <StyledTableCell align="justify">
                            <Button
                              variant="outlined"
                              key={index}
                              onClick={() => deleteTask(index)}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          </StyledTableCell>
                        </StyledTableRow>
                      </TableBody>
                    </>
                  );
                })}
          </Table>
        </TableContainer>
        <br></br>
      </Box>
      <br></br>
    </>
  );
};

export default TodoList;
