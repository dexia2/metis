<template>
  <v-data-table 
    :headers="headers" 
    :items="books" 
    class="elevation-1">
    <template 
      slot="items" 
      slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.name }}</td>
      <td>{{ props.item.latest }}</td>
      <td>{{ props.item.period }}</td>
      <td>{{ props.item.subscribe }}</td>
      <td>{{ props.item.published }}</td>
      <td>{{ props.item.author }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        { text: 'ID', value: 'id' },
        { text: '名前', value: 'name' },
        { text: '最新刊', value: 'latest' },
        { text: '出版間隔', value: 'period' },
        { text: '購読サイン', value: 'subscribe' },
        { text: '出版日', value: 'published' },
        { text: '作者', value: 'author' }
      ],
      books: [
        {
          id: 1,
          name: 'かぐや様は告らせたい~天才たちの恋愛頭脳戦~',
          latest: 12,
          period: 3,
          subscribe: 1,
          published: '2018-12-19',
          author: '赤坂アカ'
        }
      ]
    }
  }
}
</script>
