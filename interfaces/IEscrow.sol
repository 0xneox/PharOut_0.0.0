pragma solidity 0.8.12;

interface IOffers {
  function fetchOfferId(uint marketId) external returns(uint);
  function refundOffer(uint itemID, uint offerId) external;
}
interface ITrades {
  function fetchTradeId(uint marketId) external returns(uint);
  function refundTrade(uint itemId, uint tradeId) external;
}

interface IBids {
  function fetchBidId(uint marketId) external returns(uint);
  function refundBid(uint bidId) external;
}