import contractDefinition from './contracts/SimpleStorage.json'
import getContractInstance from './utils/getContractInstance'
import { GithubPicker   } from 'react-color'
import getWeb3 from './utils/getWeb3'
import getAccounts from './utils/getAccounts'
import React from 'react';
import ReactDOM from 'react-dom';
import './foundation.min.css';
import './index.css';
import Popup from "reactjs-popup";
const BigNumber = require('big-number');
const contract = require('truffle-contract');
const bigNumberToString = require('bignumber-to-string')
const numToHex = {1:'#b80000',2:'#db3e00', 3: '#fccb00', 4: '#008b02', 5: '#006b76',6: '#1273de',7: '#004dcf', 8: '#5300eb', 9: '#eb9694', 10: '#fad0c3', 11: '#fef3bd', 12: '#c1e1c5', 13: '#bedadc', 14: '#c4def6', 15: '#bed3f3', 16: '#d4c4fb', 17:'#000000' };
const hexToNum = {'#b80000':1, '#db3e00':2, '#fccb00':3, '#008b02':4, '#006b76':5, '#1273de':6, '#004dcf':7, '#5300eb':8, '#eb9694':9,'#fad0c3':10, '#fef3bd':11, '#c1e1c5':12, '#bedadc':13, '#c4def6':14,'#bed3f3':15, '#d4c4fb':16, '#000000': 17};



class PurchaseButton extends React.Component {
    constructor(props){
        super(props);
        this.state={color:null}
    }
    onHoverEnter() {
        this.setState({color:"#D3D3D3"})
    }
    onHoverLeave() {
        this.setState({color:null})
    }

    render() {
        return (
            <button className="buy-button"
                onClick={() => this.props.purchase()}
                style={{backgroundColor: this.state.color}}
                onMouseEnter={() => {this.onHoverEnter()}}
                onMouseLeave={() => {this.onHoverLeave()}}
            >
                Color
            </button>

        );
    }
}

class Square extends React.Component {

    constructor(props) {
        super(props);
        this.hoverTemp=null;
        this.state={
            color: props.color,
            pendingColor: "#000000",
            pixelNum: props.squareNum,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.hoverTemp = nextProps.color;
        this.setState({color: nextProps.color});
    }

    hoverLeave() {
        this.setState({color: this.hoverTemp});
    }

    hoverEnter() {
        this.hoverTemp = this.state.color;
        this.setState({color: "#D3D3D3"});
    }


    changeColor = (color) => {
        this.setState({pendingColor: color.hex});
    }

    render() {
        const PopupContent = (status) => {
            if (this.props.web3.currentProvider.isMetaMask) {
                return (
                    <div>
                        <div className="picker">
                            <GithubPicker
                                colors={['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB', '#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', '#C4DEF6', '#BED3F3', '#D4C4FB','#000000']}
                                triangle="hide"
                                onChangeComplete= {this.changeColor} />
                        </div>

                        <PurchaseButton
                            purchase={() => {
                                this.props.sendTransaction(this.state.pendingColor)
                                this.setState({pendingColor: "#000000"})
                            }}
                        />
                    </div>
                );
            } else {
                return <div>Install Metamask to color a pixel</div>
            }
        }
        return (
            <Popup
                trigger={
                    <button className="square"
                    style={{backgroundColor: this.state.color}}
                    onMouseLeave={() => this.hoverLeave()}
                    onMouseEnter={() => this.hoverEnter()}>
                          {}
                    </button>
                }
                position="top center"
                closeOnDocumentClick
            >
                <PopupContent />

            </Popup>
        );
    }
}

class BitMap extends React.Component {

    constructor(props) {
        super(props);
        this.numRows=50;
        this.numCols=50;
        this.hasChanged = false;
        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            squares: Array(this.numRows*this.numCols).fill(null),
        }
    }

    shouldComponentUpdate(nextProps,nextState){
        if (this.hasChanged || nextState.open) {
            this.hasChanged = false;
            return true;
        }
        return false
    }

    componentDidMount = async () => {
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3()

          // Use web3 to get the user's accounts.
          const accounts = await getAccounts(web3)

          // Get the contract instance by passing in web3 and the contract definition.
          const contract = await getContractInstance(web3, contractDefinition)

          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, accounts, contract }, this.initCanvas)
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(`Failed to load web3, accounts, or contract. Check console for details.`)
          console.log(error)
        }
    }

    initCanvas = async () => {

         let canvas = await this.state.contract.returnCanvas.call();
         const squares = this.state.squares.slice();
         for (let i = 0; i < canvas.length; i++) {
             squares[i] = numToHex[canvas[i]];
         }
         this.hasChanged = true;
         this.setState({squares: squares})


         this.state.contract.allEvents({
             fromBlock: 'latest',
             toBlock:'latest'
          }).watch((err,res) => {

              let elem = res.args;
              let pixelNum = elem.pixelNumber.c[0];
              const squares = this.state.squares.slice();
              squares[pixelNum]= elem.colorNum ? numToHex[elem.colorNum]: null;
              this.hasChanged = true;
              this.setState({squares: squares});
          })
    }


    purchasePixel(pixelNum, color) {
        console.log(hexToNum[color]);
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.state.contract.set(pixelNum,hexToNum[color],{from: accounts[0]})
        });
    }



    renderSquare(pixelNum) {
        return (
                <Square
                    color = {this.state.squares[pixelNum]}
                    web3 = {this.state.web3}
                    sendTransaction = { (color) => this.purchasePixel(pixelNum, color)}
                />
        );
    }

    renderRow(rowNum, numCols) {
        return Array.apply(null, {length: numCols}).map(Number.call, Number).map( (n) => {
            let newSquare = this.renderSquare((rowNum * this.numCols) + n);
            return newSquare;
        });
    }

    renderBoard() {
        return Array.apply(null, {length: this.numRows}).map(Number.call, Number).map((n) => {
            let row = (
                <div className="board-row">
                {
                   this.renderRow(n,this.numCols)
                }
                </div>
            );
            return row
        });
    }

    render() {

        return (
            <div>
                <div className = "game-board">
                {
                    this.renderBoard()
                }
                </div>
            </div>
        );
    }
}


export default class Canvas extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            boardInfo: ""
        }
    }

    handleInfoChange = (boardInfo) =>{
        this.setState({boardInfo: boardInfo});
    }

    render() {
        return (
            <div className="game toy">
                <a className="help-link" href={"./info.html"}> What is this? </a>
                <BitMap onPixelHover={this.handleInfoChange} />
                <div className="row">
                    <div className="large-6 columns game-info">
                        {this.state.boardInfo}
                    </div>
                </div>
            </div>
       );
    }
}
