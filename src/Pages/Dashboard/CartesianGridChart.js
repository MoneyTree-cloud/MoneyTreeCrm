import { useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet } from "../../Hooks/useApi";
import { MONTHLY_GRAPH, YEARLY_GRAPH } from "../../helpers/url_helper";
import { decryptData } from "../../components/Common/CryptoUtils";
import { useUserStore } from "../../store/useUserStore";
import { USER_TYPE } from "../../constants/global";

// Utility function to convert value to Crores
const formatToCrores = (value) => {
  if (!value) return "0";
  const croreValue = value / 10000000; // 1 Crore = 10 million
  return croreValue.toFixed(2); // Formatting to 2 decimal places
};

// Main component
export default function SalesCharts() {
  const role = useUserStore((state) => state.user.role);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const { data } = useGet(MONTHLY_GRAPH, { enabled: role === USER_TYPE.ADMIN });
  const { data: yearlyGraphData } = useGet(YEARLY_GRAPH, { enabled: role === USER_TYPE.ADMIN });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setMonthlyData(decryptedData);
        } else {
          setMonthlyData([]);
        }
      });
    }
  }, [data, setMonthlyData]);

  useEffect(() => {
    if (yearlyGraphData?.data?.status === 1) {
      decryptData(yearlyGraphData?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setYearlyData(decryptedData);
        } else {
          setYearlyData([]);
        }
      });
    }
  }, [setYearlyData, yearlyGraphData]);

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Mapping full month names to abbreviated ones
  const monthNameMapping = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  // Normalize full month names to abbreviations
  const normalizedData = monthlyData?.map((item) => {
    // Check if month name is already abbreviated or if we need to map it
    const normalizedMonth = monthNameMapping[item?.name] || item?.name;
    return {
      name: normalizedMonth,
      value: item?.value,
    };
  });

  // Sort the data based on the month order
  const sortedMonthlyData = normalizedData?.sort((a, b) => {
    return monthOrder?.indexOf(a?.name) - monthOrder?.indexOf(b.name);
  });

  return (
    <Row>
      {Array.isArray(sortedMonthlyData) && sortedMonthlyData.length > 0 && (
        <Col xl={7} xs={12}>
          <Card>
            <CardBody>
              <h6 style={{ textAlign: "center" }}>Monthly Sales Data</h6>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={Array.isArray(sortedMonthlyData) ? sortedMonthlyData : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* <XAxis
                    dataKey="name"
                    tickFormatter={(tick) =>
                      tick.length > 10 ? tick.substring(0, 10) + "..." : tick
                    }
                  />
                  <YAxis
                    tickFormatter={(value) => `${formatToCrores(value)} Cr`} // Format Y-Axis to crores
                    domain={[0, "dataMax + 1000"]}
                  /> */}
                  <Tooltip
                    formatter={(value) => `${formatToCrores(value)} Cr`}
                  />
                  <Bar dataKey="value">
                    {Array.isArray(sortedMonthlyData) &&
                      sortedMonthlyData
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index % 2 === 0
                                ? defaultTheme.primary
                                : defaultTheme.goldColorLogo
                            }
                          />
                        ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </Col>
      )}
      {Array.isArray(yearlyData) && yearlyData.length > 0 && (
        <Col xl={5} xs={12}>
          <Card>
            <CardBody>
              <h6 style={{ textAlign: "center" }}>Yearly Sales Data</h6>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart
                  data={
                    Array.isArray(yearlyData)
                      ? yearlyData
                      : []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* <XAxis
                    dataKey="name"
                    tickFormatter={(tick) =>
                      tick.length > 10 ? tick.substring(0, 10) + "..." : tick
                    }
                  />
                  <YAxis
                    tickFormatter={(value) => `${formatToCrores(value)} Cr`} // Format Y-Axis to crores
                    domain={[0, "dataMax + 5000"]}
                  /> */}
                  <Tooltip
                    formatter={(value) => `${formatToCrores(value)} Cr`}
                  />
                  <Bar dataKey="value">
                    {Array.isArray(yearlyData) &&
                      yearlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index % 2 === 0
                              ? defaultTheme.primary
                              : defaultTheme.goldColorLogo
                          }
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </Col>
      )}
    </Row>
  );
}
