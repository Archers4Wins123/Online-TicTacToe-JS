import './App.css';
import { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

function App() {
  const URL = "ws://localhost:8080/play";
  /*useEffect(() => {
    const websocket = new WebSocket(URL)

    websocket.onopen = () => {
      console.log('connected');
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
    }
  }, []);*/
  const {sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket} = useWebSocket(URL, {
      onOpen: () => console.log('opened'),
      shouldReconnect: (closeEvent) => true,
  });
  const [messageHistory, setMessageHistory] = useState([]);
  const handleClickSendMessage = (x, y) => {
    sendMessage(`make_turn#{"x":${x},"y":${y}}`);
    console.log("lastMessage="+JSON.stringify(lastMessage.data));
  };
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  const [gameState, setGameState] = useState({
    playerAtTurn: 'X',
    field: [["X","X",""],["X","X","O"],["X","X"," "]],
    winningPlayer: null,
    isBoardFull: false,
    connectedPlayers: []
  });
  useEffect(()=> {
    //getWebSocket().onmessage = console.log;
    //getWebSocket().onclose = ()=> {
    //  console.log("WebSocket socket closed.")
    //};
    if(lastMessage !== null) {
      console.log("received =" + JSON.stringify(lastMessage.data));
      setGameState(JSON.parse(lastMessage.data));
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);
  return (
    <div className="App">
      <div>{!gameState.connectedPlayers.includes("X") && <span>Waiting for Player X</span>}</div>
      <div>{gameState.connectedPlayers.includes("X") && !gameState.connectedPlayers.includes("O") && <span>Waiting for Player O</span>}</div>
      <div>{gameState.connectedPlayers.includes("X") && gameState.connectedPlayers.includes("O") 
      && gameState.isBoardFull === false && !gameState.winningPlayer 
      && <span>{gameState.playerAtTurn === "X" ? 'X is next' : 'O is next'}</span>}</div>
      <table>
        <tbody>
          {gameState.field.map((subArray, index)=>(
            <tr>              
              <td><Square y={index} x={0} value={subArray[0]} handleClickSendMessage={handleClickSendMessage}></Square></td>
              <td><Square y={index} x={1} value={subArray[1]} handleClickSendMessage={handleClickSendMessage}></Square></td> 
              <td><Square y={index} x={2} value={subArray[2]} handleClickSendMessage={handleClickSendMessage}></Square></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>{gameState.winningPlayer !== null && gameState.winningPlayer !== undefined ? `Player ${gameState.winningPlayer} won!` : 
      (gameState.isBoardFull === true && "It's a draw!")}</div>
      {/*<div>readystate is {readyState}, {connectionStatus}</div>
      <span>The WebSocket is currently {connectionStatus}</span>
          <div>{lastMessage ? <span>Last message: {lastMessage.data}</span> : null}</div>*/}
      
    </div>
  );
}

const Square = (props)=> {
  return (
  <button onClick={(e)=>{
    console.log("Clicked="+e.target.value);
    props.handleClickSendMessage(props.x, props.y)
  }} 
  style={{width: '30px', height: '30px'}}>{props.value}</button>
  );
}
export default App;
