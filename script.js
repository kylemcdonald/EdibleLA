d3.csv("fruits.csv").then(data => {

    data.forEach(d => {
        d.Name = d.Name.split(/[;()]/)[0].trim().toLowerCase();
    });

    const svg = d3.select("svg"),
        margin = { top: 40, right: 20, bottom: 30, left: 200 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]),
        y = d3.scaleBand().range([height, 0]).padding(0.1),
        today = new Date(),
        startOfYear = new Date(today.getFullYear(), 0, 0),
        dayOfYear = Math.floor((today - startOfYear) / 1000 / 60 / 60 / 24),
        monthToDay = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert month names to day of year
    const monthToNumber = (month) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthToDay[months.indexOf(month)] || 0;
    };

    // Adjust data preprocessing
    data.forEach(d => {
        d.Start = d.Start === "Year-round" ? 1 : monthToNumber(d.Start);
        d.Finish = d.Finish === "Year-round" ? 365 : monthToNumber(d.Finish);
        // Handle seasons extending through New Year
        d.OverlapsNewYear = d.Finish < d.Start;
    });

    // Sort data by starting day of the season
    data.sort((a, b) => a.Start - b.Start);

    x.domain([1, 365]);
    y.domain(data.map(d => d.Name));

    // Draw bars with logic for New Year overlap
    data.forEach(d => {
        let isOverlappingCurrentDay = (dayOfYear >= d.Start && dayOfYear <= d.Finish) || (d.OverlapsNewYear && ((dayOfYear + 365) >= d.Start && dayOfYear <= d.Finish));
        let barColor = isOverlappingCurrentDay ? "pink" : "lightblue";

        // Draw regular or year-round fruit bar
        if (!d.OverlapsNewYear) {
            g.append("rect")
                .attr("y", y(d.Name))
                .attr("height", y.bandwidth())
                .attr("x", x(d.Start))
                .attr("width", x(d.Finish) - x(d.Start))
                .attr("fill", barColor);
        } else {
            // Draw bar from Start to end of year
            g.append("rect")
                .attr("y", y(d.Name))
                .attr("height", y.bandwidth())
                .attr("x", x(d.Start))
                .attr("width", x(365) - x(d.Start))
                .attr("fill", barColor);
            // Draw bar from start of year to Finish
            g.append("rect")
                .attr("y", y(d.Name))
                .attr("height", y.bandwidth())
                .attr("x", x(1))
                .attr("width", x(d.Finish) - x(1))
                .attr("fill", barColor);
        }

        // Add text label for each bar
        g.append("text")
            .attr("x", x(isOverlappingCurrentDay ? dayOfYear : d.Start) + 5) // Adjust this value to position the label correctly
            .attr("y", y(d.Name) + y.bandwidth() / 2) // Adjust this value to position the label correctly
            .attr("dy", ".35em") // Vertically center text
            .text(d.Name)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black");
    });

    // Add the current day line
    g.append("line")
        .attr("x1", x(dayOfYear))
        .attr("x2", x(dayOfYear))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Add Y axis
    g.append("g").call(d3.axisLeft(y));

    // Add the X Axis with approximate month names
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(i => {
            // Convert day of the year back to approximate month for tick labels
            for (let m = 0; m < monthToDay.length; m++) {
                if (i < monthToDay[m]) {
                    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
                }
            }
            return "Dec";
        }))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
});