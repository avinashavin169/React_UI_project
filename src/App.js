import React, { useState, useEffect } from "react";
import fetch from './api/dataService';
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';

function calculateResults(incomingData) {
  // Calculate points per transaction

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const everyTransPoints = incomingData.map(transaction => {
    let points = 0;
    let handleAboveHundredAmt = transaction.amt - 100;

    if (handleAboveHundredAmt > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction      
      points += (handleAboveHundredAmt * 2);
    }
    if (transaction.amt > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return { ...transaction, points, month };
  });

  let customerData = {};
  let totalPointsOfCustomer = {};
  everyTransPoints.forEach(everyTransPoints => {
    let { custid, name, month, points } = everyTransPoints;
    if (!customerData[custid]) {
      customerData[custid] = [];
    }
    if (!totalPointsOfCustomer[custid]) {
      totalPointsOfCustomer[name] = 0;
    }
    totalPointsOfCustomer[name] += points;
    if (customerData[custid][month]) {
      customerData[custid][month].points += points;
      customerData[custid][month].monthNumber = month;
      customerData[custid][month].numTransactions++;
    }
    else {

      customerData[custid][month] = {
        custid,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      }
    }
  });
  let totalData = [];
  for (var custKey in customerData) {
    customerData[custKey].forEach(cRow => {
      totalData.push(cRow);
    });
  }
  
  let totalDataByCustomer = [];
  for (custKey in totalPointsOfCustomer) {
    totalDataByCustomer.push({
      name: custKey,
      points: totalPointsOfCustomer[custKey]
    });
  }
  return {
    summaryByCustomer: totalData,
    everyTransPoints,
    totalPointsOfCustomer: totalDataByCustomer
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: 'Customer',
      accessor: 'name',
      style: {
        borderRadius: "5px",
      }
    },
    {
      Header: 'Month',
      accessor: 'month',
      style: {
        borderRadius: "5px",
      }
    },
    {
      Header: "Number of Transactions",
      accessor: 'numTransactions',style: {
        borderRadius: "5px",
      }
    },
    {
      Header: 'Reward Points',
      accessor: 'points',style: {
        borderRadius: "5px",
      }
    }
  ];

  const totalsByColumns = [
    {
      Header: 'Customer',
      accessor: 'name',
      style: {
        borderRadius: "5px",
      }
    },
    {
      Header: 'Points',
      accessor: 'points',
      style: {
        borderRadius: "5px",
      }
    }
  ]

  function handleIndividualTransactions(row) {
    let byCustMonth = _.filter(transactionData.everyTransPoints, (tRow) => {
      return row.original.custid === tRow.custid && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => {
    fetch().then((data) => {
      const results = calculateResults(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return transactionData == null ?
    <div>Loading...</div>
    :
    <div>
      <div className="tranTable">
        <div className="container">
        <div className="row">
          <div className="col-10">
            <h4>Customer Month Wise Reward system </h4>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              showPagination={false}
              defaultPageSize={7}
              columns={columns}
              getTdProps={() => ({
                style: {
                textAlign: 'center',
                backgroundColor: 'PeachPuff'
                }
                })}
                getTheadProps={() => ({
                  style: {
                  textAlign: 'center',
                  backgroundColor: '#ccf1f7'
                  }
                  })}
              SubComponent={row => {
                return (
                  <div>

                    {handleIndividualTransactions(row).map(tran => {
                      return <div className="container" key={tran.transactionDt + tran.amt}>
                        <div className="row">
                          <div className="col-8">
                            <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                          </div>
                        </div>
                      </div>
                    })}

                  </div>
                )
              }}
            />
          </div>
        </div>
       </div>
      </div>
      <div className="tranTable">
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h4> Total Points Earned By Customer</h4>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.totalPointsOfCustomer}
              columns={totalsByColumns}
              defaultPageSize={3}
              showPagination={false}
              getTdProps={() => ({
                style: {
                textAlign: 'center',
                backgroundColor: 'PeachPuff'
                }
                })}

                getTheadProps={() => ({
                  style: {
                  textAlign: 'center',
                  backgroundColor: '#ccf1f7'
                  }
                  })}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
    ;
}

export default App;
