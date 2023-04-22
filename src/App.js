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
  const handleClickSendMessage = useCallback(() => {
    sendMessage('make_turn#{"x":0,"y":0}');
    console.log("lastMessage="+lastMessage);
  }, []);
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
      console.log("received =" + lastMessage);
      setMessageHistory((prev) => prev.concat(lastMessage));
      try {
        console.log("parsed to " + JSON.parse(lastMessage));
      } catch(e) {
        console.log("parse failed");
      }
    }
  }, [lastMessage, setMessageHistory]);
  return (
    <div className="App">
      <table>
        <tbody>
          {gameState.field.map((subArray, index)=>(
            <tr>              
              <td><button onClick={handleClickSendMessage} style={{width: '30px', height: '30px'}}>{subArray[0]}</button></td>
              <td><button style={{width: '30px', height: '30px'}}>{subArray[1]}</button></td> 
              <td><button style={{width: '30px', height: '30px'}}>{subArray[2]}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>readystate is {readyState}, {connectionStatus}</div>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
}

export default App;
