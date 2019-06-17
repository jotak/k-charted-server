package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAddToGroups(t *testing.T) {
	assert := assert.New(t)

	groups := []grouped{}
	keys := []string{"a", "b", "c"}

	groups = addToGroups(groups, keys, []string{"1", "2", "3"})

	assert.Equal(numberOfNodes(groups), 3)

	assert.Len(groups, 1)
	assert.Equal(groups[0].Key, "a")
	assert.Equal(groups[0].Value, "1")

	assert.Len(groups[0].Nested, 1)
	assert.Equal(groups[0].Nested[0].Key, "b")
	assert.Equal(groups[0].Nested[0].Value, "2")

	assert.Len(groups[0].Nested[0].Nested, 1)
	assert.Equal(groups[0].Nested[0].Nested[0].Key, "c")
	assert.Equal(groups[0].Nested[0].Nested[0].Value, "3")

	assert.Len(groups[0].Nested[0].Nested[0].Nested, 0)

	groups = addToGroups(groups, keys, []string{"10", "20", "30"})

	assert.Equal(numberOfNodes(groups), 6)

	assert.Len(groups, 2)
	assert.Equal(groups[1].Key, "a")
	assert.Equal(groups[1].Value, "10")

	assert.Len(groups[1].Nested, 1)
	assert.Equal(groups[1].Nested[0].Key, "b")
	assert.Equal(groups[1].Nested[0].Value, "20")

	assert.Len(groups[1].Nested[0].Nested, 1)
	assert.Equal(groups[1].Nested[0].Nested[0].Key, "c")
	assert.Equal(groups[1].Nested[0].Nested[0].Value, "30")

	assert.Len(groups[1].Nested[0].Nested[0].Nested, 0)

	groups = addToGroups(groups, keys, []string{"1", "2", "4"})

	assert.Equal(numberOfNodes(groups), 7)
	assert.Len(groups[0].Nested[0].Nested, 2)
	assert.Equal(groups[0].Nested[0].Nested[1].Key, "c")
	assert.Equal(groups[0].Nested[0].Nested[1].Value, "4")

	// Test no duplicate
	groups = addToGroups(groups, keys, []string{"1", "2", "4"})
	assert.Equal(numberOfNodes(groups), 7)
}

func numberOfNodes(groups []grouped) int {
	count := len(groups)
	for _, g := range groups {
		count += numberOfNodes(g.Nested)
	}
	return count
}
