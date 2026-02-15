import React from "react";

const Totals = props => {
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Activity totals</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Last 4 Weeks</th>
                </tr>
                <tr>
                    <td>Avg Rides / Week</td>
                    <td>distance goes here</td>
                </tr>
                <tr>
                    <td>Avg Distance / Week</td>
                    <td>miles go here</td>
                </tr>
                <tr>
                    <td>What other data should go here???</td>
                </tr>
            </tbody>

            <tbody id="cycling-ytd">
                <tr>
                    <td>Distance</td>
                    <td>ytd distance</td>
                </tr>
                <tr>
                    <td>Elev Gain</td>
                    <td>ytd elevation</td>
                </tr>
                <tr>
                    <td>Rides</td>
                    <td>ytd rides</td>
                </tr>
            </tbody>

            <tbody>
                <tr>
                    <th>All-Time</th>
                </tr>
                <tr>
                    <td>Distance</td>
                    <td>all time distance</td>
                </tr>
                <tr>
                    <td>Rides</td>
                    <td>All time rides</td>
                </tr>
                <tr>
                    <td>Biggest Ride</td>
                    <td>A ride</td>
                </tr>
            </tbody>
        </table>
    )
}

export default Totals;