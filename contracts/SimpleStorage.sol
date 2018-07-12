pragma solidity ^0.4.18;

contract SimpleStorage {
    mapping(uint => uint8 ) colorNums;
    uint constant canvasSize = 2500;
    uint constant maxNumColors = 17;

    event PixelPurchased(uint24 indexed pixelNumber, uint8 colorNum );

    function setPixels(uint16[] pixels, uint8[] colors) public {
        if (pixels.length != colors.length || pixels.length == 0) revert();

        for (uint i = 0; i < pixels.length; i++) {
            set(pixels[i],colors[i]);
        }
    }

    function set(uint16 pixelNum, uint8 colorNum) private {
        if(pixelNum >= canvasSize || colorNum > maxNumColors || colorNum == 0 ) revert();
        
        colorNums[pixelNum] = colorNum;
        emit PixelPurchased(pixelNum, colorNum);
    }

    function returnCanvas() public view returns(uint8[canvasSize]){
        uint8[canvasSize] memory returnArray;
        for (uint i = 0; i < returnArray.length;i++) {
            if (colorNums[i] > 0) {
                returnArray[i] = colorNums[i];
            }
        }
        return returnArray;
    }
}
