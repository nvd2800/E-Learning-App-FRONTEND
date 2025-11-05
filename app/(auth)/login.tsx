import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { if (!loading && user) router.replace("/(tabs)"); }, [loading, user]);

  const onLogin = async () => {
    try { setSubmitting(true); await signIn(email, password); router.replace("/(tabs)"); }
    catch (e) { Alert.alert("Đăng nhập thất bại", "Vui lòng kiểm tra lại"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex:1, padding:20, backgroundColor:"#f6f7fb" }}>
      <View style={{ flex:1, justifyContent:"center" }}>
        <Text style={{ fontSize:28, fontWeight:"800", marginBottom:20 }}>Đăng nhập</Text>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
          value={email} onChangeText={setEmail}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:12, backgroundColor:"#fff" }} />
        <TextInput placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:16, backgroundColor:"#fff" }} />
        <TouchableOpacity onPress={onLogin} disabled={submitting}
          style={{ backgroundColor:"#111827", padding:14, borderRadius:12, alignItems:"center" }}>
          {submitting ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Đăng nhập</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop:16, alignItems:"center" }}>
          <Text>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
