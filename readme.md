# EdibleLA

Building towards a tool for checking when fruit might be available for urban foraging in Los Angeles.

* `trees.txt` is extracted from the LA [Tree Keeper](https://losangelesca.treekeepersoftware.com/index.cfm?deviceWidth=1728) interface.
* `edible.txt` is a filtered list of only the trees that produce edible fruit, according to GPT-4.
* `edible-sorted.txt` is sorted by GPT-4 in order of tastiness.
* `fruits.csv` is a rough placeholder table generated by GPT-4 using the following prompt:

```
Given all the trees in the list below, create a table with the columns:

- Name (copy this directly from the original list)
- Start (month when fruit is typically first ripe)
- Finish (month when fruit is last ripe)

Give results based on the typical climate these trees would experience in Los Angeles. If there is a range in months, only give one month as an answer. Do not provide any other additional commentary, and copy the original names exactly:
```

All the GPT-4-generated data should be treated as extremely suspicious, and I know at least some of the data is wrong (e.g. loquats may be ripe as early as February).