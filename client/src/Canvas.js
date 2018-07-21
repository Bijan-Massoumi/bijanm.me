import contractDefinition from './contracts/SimpleStorage.json'
import getContractInstance from './utils/getContractInstance'
import { GithubPicker   } from 'react-color'
import getWeb3 from './utils/getWeb3'
import getAccounts from './utils/getAccounts'
import React from 'react';
import ReactDOM from 'react-dom';
import './foundation.min.css';
import './fontawesome-free-5.0.13/web-fonts-with-css/css/fontawesome-all.css';
import './fontawesome-free-5.0.13/web-fonts-with-css/css/fontawesome.min.css';
import './index.css';
import Popup from "reactjs-popup";
const BigNumber = require('big-number');
const contract = require('truffle-contract');
const bigNumberToString = require('bignumber-to-string')
const numToHex = {1:'#b80000',2:'#db3e00', 3: '#fccb00', 4: '#008b02', 5: '#006b76',6: '#1273de',7: '#004dcf', 8: '#5300eb', 9: '#eb9694', 10: '#fad0c3', 11: '#fef3bd', 12: '#c1e1c5', 13: '#bedadc', 14: '#c4def6', 15: '#bed3f3', 16: '#d4c4fb', 17:'#000000' };
const hexToNum = {'#b80000':1, '#db3e00':2, '#fccb00':3, '#008b02':4, '#006b76':5, '#1273de':6, '#004dcf':7, '#5300eb':8, '#eb9694':9,'#fad0c3':10, '#fef3bd':11, '#c1e1c5':12, '#bedadc':13, '#c4def6':14,'#bed3f3':15, '#d4c4fb':16, '#000000': 17};


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

    render() {
        let buttonStyle = {
            backgroundColor: this.state.color,
            width: this.props.squareDim,
            height: this.props.squareDim
        };

        if (this.props.dimmed){
            return (
                    <button className="square dimmed"
                        style={buttonStyle}
                        onMouseLeave={() => this.hoverLeave()}
                        onMouseEnter={() => this.hoverEnter()}
                        onClick={() => this.props.onSquareClick()}/>

            );
        } else {
            return (
                    <button className="square"
                        style={buttonStyle}
                        onMouseLeave={() => this.hoverLeave()}
                        onMouseEnter={() => this.hoverEnter()}
                        onClick={() => this.props.onSquareClick()}/>
            );
        }
    }
}

class BitMap extends React.Component {

    constructor(props) {
        super(props);
        this.hasReceivedPixels = false;
        this.hasEditedDiffs = false;
        this.state = {
            web3:null,
            contract: null,
            squares: Array(this.props.dim*this.props.dim).fill(null),
            squareDim: this.getSquareDim()
        }
    }

    shouldComponentUpdate(nextProps,nextState){
        if (this.hasReceivedPixels || this.hasEditedDiffs
            ||(this.props.potentialDiffs.length > 0 && nextProps.potentialDiffs.length === 0)
            || this.state.squareDim !== nextState.squareDim) {
            this.hasReceivedPixels = false;
            this.hasEditedDiffs = false;
            return true;
        }
        return false
    }

    getSquareDim() {
        if (window.innerWidth < 390) {
            return 6.5;
        } else if (window.innerWidth < 500){
            return 8;
        } else {
            return 10;
        }
    }

    componentDidMount = async () => {
        window.addEventListener('resize', () => this.setState({squareDim: this.getSquareDim()}))
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3()

          // Get the contract instance by passing in web3 and the contract definition.
          const contract = await getContractInstance(web3, contractDefinition)

          this.setState({web3, contract}, this.initCanvas)
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
         this.hasReceivedPixels = true;
         this.setState({squares: squares})


         this.state.contract.allEvents({
             fromBlock: 'latest',
             toBlock:'latest'
          }).watch((err,res) => {

              let elem = res.args;
              let pixelNum = elem.pixelNumber.c[0];
              const squares = this.state.squares.slice();
              squares[pixelNum]= elem.colorNum ? numToHex[elem.colorNum]: null;
              this.hasReceivedPixels = true;
              this.setState({squares: squares});
          })
    }

    //helper for renderSquare: demultiplexes the two types of edits to diff array

    addOrRemove(pixelNum) {
        if (this.state.web3 && this.state.web3.currentProvider.isMetaMask){
            this.hasEditedDiffs = true;
            if (this.props.potentialDiffs.findIndex( (obj) => obj.pixelNum === pixelNum) === -1) {
                this.props.addToDeltas(pixelNum);
            } else {
                this.props.deselect(pixelNum);
            }
        } else {
            alert('Install and Unlock Metamask to draw on the Canvas please.')
        }
    }

    renderSquare(pixelNum) {
        const pixelsIdx = this.props.potentialDiffs.findIndex( (obj) => obj.pixelNum === pixelNum);
        const dimmed = (this.props.potentialDiffs.length > 0 && pixelsIdx === -1) ? true: false;
        const color = (!dimmed && pixelsIdx > -1) ? this.props.potentialDiffs[pixelsIdx].color: this.state.squares[pixelNum];


        return (
                <Square
                    color={color}
                    diffs={this.props.potentialDiffs}
                    onSquareClick={() => this.addOrRemove(pixelNum)}
                    dimmed={dimmed}
                    squareDim={this.state.squareDim}
                />
        );
    }

    renderRow(rowNum) {
        return Array.apply(null, {length: this.props.dim}).map(Number.call, Number).map( (n) => {
            let newSquare = this.renderSquare((rowNum * this.props.dim) + n);
            return newSquare;
        });
    }

    renderBoard() {
        return Array.apply(null, {length: this.props.dim}).map(Number.call, Number).map((n) => {
            let row = (
                <div className="board-row">
                {
                   this.renderRow(n)
                }
                </div>
            );
            return row
        });
    }

    render() {
        console.log("diffs received",this.props.potentialDiffs)
        return (
            <div className="row all-squares">
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
        this.dim = 50;
        this.diffsAltered = false;
        this.state={
            web3: null,
            contract: null,
            potentialDiffs: [],
            selectedColor: "#000000",
            padding: this.getCorrectPadding()
        }
    }


    getCorrectPadding() {
        if (window.innerWidth <= 390) {
             return 3.5;
        } else if (window.innerWidth < 500) {
            return 10;
        } else {
            return 30;
        }
    }

    componentDidMount = async () => {
        window.addEventListener('resize', () => this.setState({padding: this.getCorrectPadding()}))
        try {
          // Get network provider and web3 instance.
          const web3 = await getWeb3()

          // Get the contract instance by passing in web3 and the contract definition.
          const contract = await getContractInstance(web3, contractDefinition)

          this.setState({web3, contract})
        } catch (error) {
          console.log(error)
        }
    }

    shouldComponentUpdate(nextProps,nextState) {
        if ((nextState.padding !== this.state.padding) || this.diffsAltered) {
            this.diffsAltered = false;
            return true;
        }
        return false;
    }

    changeColor = (color) => {
        this.setState({selectedColor: color.hex});
    }

    addToDeltas(color,pixelNum){
        console.log('adding to deltas',pixelNum);
        this.diffsAltered = true;
        const newDiffs = this.state.potentialDiffs.slice();
        newDiffs.push({pixelNum:pixelNum, color:color});
        this.setState({potentialDiffs: newDiffs})
    }

    removeFromArray(newColor,pixelNum) {
        console.log('removing from deltas');
        this.diffsAltered = true;
        const newDiffs = this.state.potentialDiffs.slice();
        const idx = newDiffs.findIndex( (obj) => obj.pixelNum === pixelNum);
        newDiffs[idx].color === newColor ? newDiffs.splice(idx, 1): newDiffs[idx].color = newColor;
        this.setState({potentialDiffs: newDiffs});
    }

    sendTransaction(){
        if(this.state.web3 && this.state.potentialDiffs.length > 0) {
            const pixelNums = this.state.potentialDiffs.map( (obj) => obj.pixelNum );
            const colors = this.state.potentialDiffs.map( (obj) => hexToNum[obj.color] );
            this.state.web3.eth.getAccounts((error, accounts) => {
                console.log(pixelNums,colors);
                this.state.contract.setPixels(pixelNums,colors,{from: accounts[0]});
                this.setState({potentialDiffs: []});
            });
        }
    }

    render() {
        const paddingStyle = {
            marginLeft: this.state.padding,
            fontSize: 35
        };

        const HelpPopupButton = () =>
            <Popup
                trigger={<button className="menu-item far fa-question-circle trash-buy question" style={paddingStyle}/>}
                position= {this.state.padding > 10 ? "bottom center": "right center"}
                closeOnDocumentClick
            >
                This is a canvas whose state is stored on the Ethereum Blockchain.
                To write to the canvas: download and install the Metamask browser extension,
                create a wallet, select some pixels, then send a transaction
                by clicking the up arrow! Once the transaction is confirmed, it will appear here.
                Thanks for visiting!
            </Popup>



        return (
            <div className="game toy">
                <div className="row menu-bar">
                    <HelpPopupButton />
                    <div className="menu-item">
                        <div style={paddingStyle}>
                            <GithubPicker
                                colors={['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB', '#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', '#C4DEF6', '#BED3F3', '#D4C4FB','#000000']}
                                width = {this.state.padding === 3.5? "150px": "200px"}
                                triangle="hide"
                                onChangeComplete= {this.changeColor} />
                        </div>
                    </div>
                    <div className="menu-item trash-buy" style={paddingStyle}>
                        <button className="fas fa-trash-alt set"
                        onClick={() => {
                            this.diffsAltered = true;
                            this.setState({potentialDiffs: []})
                        } }/>
                    </div>
                    <div className="menu-item trash-buy" style={paddingStyle}>
                        <button className="fas fa-arrow-circle-up set"
                        onClick={() => {
                            this.diffsAltered = true;
                            this.sendTransaction()
                        }}/>
                    </div>
                </div>
                <BitMap
                    dim={this.dim}
                    potentialDiffs={this.state.potentialDiffs}
                    addToDeltas={(pixelNum) => this.addToDeltas(this.state.selectedColor,pixelNum)}
                    deselect={(pixelNum) => this.removeFromArray(this.state.selectedColor,pixelNum)}
                    />
            </div>
       );
    }
}

/*
purchasePixel(pixelNum, color) {
    console.log(hexToNum[color]);
    this.state.web3.eth.getAccounts((error, accounts) => {
        this.state.contract.set(pixelNum,hexToNum[color],{from: accounts[0]})
    });
}
*/
